from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class SearchRateThrottle(UserRateThrottle):
    """Custom throttle for search endpoints"""
    scope = 'search'

class CartRateThrottle(UserRateThrottle):
    """Custom throttle for cart operations"""
    scope = 'cart'

class LoginRateThrottle(AnonRateThrottle):
    """Custom throttle for login attempts"""
    scope = 'login'

class AdminRateThrottle(UserRateThrottle):
    """Custom throttle for admin endpoints"""
    scope = 'admin'
    
    def allow_request(self, request, view):
        """Only apply throttling to non-admin users"""
        if request.user and request.user.is_staff:
            return True
        return super().allow_request(request, view)