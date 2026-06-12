// ════════════════════════════════════════════════
//  ApiResponse — for successful responses
// ════════════════════════════════════════════════

class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success    = true;
    this.statusCode = statusCode;
    this.message    = message;
    this.data       = data;
  }
}

// ════════════════════════════════════════════════
//  ApiError — for error responses
// ════════════════════════════════════════════════

class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);        // makes err.message work
    this.success    = false;
    this.statusCode = statusCode;
    this.message    = message;
    this.errors     = errors;
  }
}

module.exports = { ApiResponse, ApiError };