import api from '../services/api';

/**
 * Downloads a PDF securely via authenticated Axios blob request
 * @param {string} endpoint - API endpoint e.g. '/quotations/123/pdf'
 * @param {string} fallbackFilename - default filename e.g. 'Quotation.pdf'
 * @returns {Promise<boolean>}
 */
export const downloadPdfBlob = async (endpoint, fallbackFilename = 'document.pdf') => {
  try {
    const token = localStorage.getItem('cryo_sales_token');
    const response = await api.get(endpoint, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    });

    // Try to extract filename from content-disposition
    let filename = fallbackFilename;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);

    return true;
  } catch (error) {
    console.error('PDF Download failed:', error);
    throw error;
  }
};

/**
 * Gets a blob URL for in-app PDF preview in an iframe or viewer
 * @param {string} endpoint
 * @returns {Promise<string>}
 */
export const getPdfBlobUrl = async (endpoint) => {
  try {
    const response = await api.get(endpoint, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return window.URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to get PDF blob URL:', error);
    throw error;
  }
};

/**
 * Generates an authenticated direct URL with query token
 * @param {string} endpoint - e.g. '/quotations/123/pdf'
 * @returns {string}
 */
export const getDirectPdfUrl = (endpoint) => {
  const token = localStorage.getItem('cryo_sales_token') || '';
  const base = import.meta.env.VITE_API_URL || '/api';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const separator = cleanEndpoint.includes('?') ? '&' : '?';
  return `${base}${cleanEndpoint}${separator}token=${encodeURIComponent(token)}`;
};

