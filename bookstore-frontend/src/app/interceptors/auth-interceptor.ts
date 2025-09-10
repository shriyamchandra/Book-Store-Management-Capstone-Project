import { HttpInterceptorFn } from '@angular/common/http';

// Attach Authorization header for API requests if token is present
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const isApi = req.url.startsWith('/api') || req.url.startsWith('http://localhost:8080/api');
  if (token && isApi) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

