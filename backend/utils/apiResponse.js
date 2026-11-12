class ApiResponse {
  /**
   * Send a standardised success response.
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {*} data
   */
  static success(res, statusCode, message, data = null) {
    const response = { success: true, message };
    if (data !== null && data !== undefined) {
      response.data = data;
    }
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
