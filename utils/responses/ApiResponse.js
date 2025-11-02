class ApiResponse {
    constructor(res, statusCode, data = null, message = 'Success') {
      this.res = res;
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.success = statusCode < 400;
    }
  
    send() {
      this.res.status(this.statusCode).json({
        success: this.success,
        status: this.statusCode,
        message: this.message,
        data: this.data
      });
    }
  }
  
  module.exports = ApiResponse;
