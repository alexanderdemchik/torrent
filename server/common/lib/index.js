"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message ? message : this.getMessage(status);
    }
    getMessage(status) {
        switch (status) {
            case 400: return 'BAD_REQUEST';
            case 404: return 'NOT_FOUND';
            default: return '';
        }
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=index.js.map