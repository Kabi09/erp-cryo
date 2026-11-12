import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { getPdfBlobUrl, downloadPdfBlob } from '../../utils/pdfDownloader';
import { Download, Printer, ExternalLink, RefreshCw } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export const PdfPreviewModal = ({
  isOpen,
  onClose,
  endpoint,
  title = 'Commercial Document Preview',
  filename = 'document.pdf',
}) => {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    let activeUrl = '';
    const loadPdf = async () => {
      if (!isOpen || !endpoint) return;
      try {
        setLoading(true);
        setError('');
        const url = await getPdfBlobUrl(endpoint);
        activeUrl = url;
        setBlobUrl(url);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load PDF preview');
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (activeUrl) {
        window.URL.revokeObjectURL(activeUrl);
      }
    };
  }, [isOpen, endpoint]);

  const handleDownload = async () => {
    try {
      await downloadPdfBlob(endpoint, filename);
      addToast({ type: 'success', title: 'Downloaded', message: `Saved ${filename}` });
    } catch (err) {
      addToast({ type: 'error', title: 'Download Failed', message: 'Could not download PDF' });
    }
  };

  const handlePrint = () => {
    if (blobUrl) {
      const iframe = document.getElementById('pdf-preview-frame');
      if (iframe) {
        iframe.contentWindow?.print();
      } else {
        window.open(blobUrl, '_blank');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`Previewing generated Cryo Scientific document (${filename})`}
      size="full"
    >
      <div className="space-y-3">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-slate-700 truncate">{filename}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
              disabled={loading || !blobUrl}
              className="hidden sm:inline-flex"
            >
              Print
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={ExternalLink}
              onClick={() => blobUrl && window.open(blobUrl, '_blank')}
              disabled={loading || !blobUrl}
            >
              Open Tab
            </Button>
            <Button
              size="sm"
              icon={Download}
              onClick={handleDownload}
              disabled={loading}
            >
              Download
            </Button>
          </div>
        </div>

        {/* PDF Viewer Frame */}
        <div className="w-full h-[60vh] sm:h-[70vh] bg-slate-200/60 rounded-xl overflow-hidden border border-slate-200 relative flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
              <span>Generating document preview...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-center p-6 text-xs text-red-600 bg-red-50 rounded-xl border border-red-200 max-w-md">
              <p className="font-bold">Failed to load preview</p>
              <p className="mt-1">{error}</p>
              <Button size="sm" variant="secondary" className="mt-3" onClick={onClose}>
                Close
              </Button>
            </div>
          )}

          {blobUrl && !loading && !error && (
            <iframe
              id="pdf-preview-frame"
              src={blobUrl}
              title={title}
              className="w-full h-full border-none rounded-xl"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

