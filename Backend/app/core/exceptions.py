class AppException(Exception):
    status_code = 500
    error_code = "INTERNAL_ERROR"
    
    def __init__(self, message: str = "Internal error", details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class NotFoundException(AppException):
    status_code = 404
    error_code = "NOT_FOUND"

class BadRequestException(AppException):
    status_code = 400
    error_code = "BAD_REQUEST"

class UnauthorizedException(AppException):
    status_code = 401
    error_code = "UNAUTHORIZED"

class ForbiddenException(AppException):
    status_code = 403
    error_code = "FORBIDDEN"