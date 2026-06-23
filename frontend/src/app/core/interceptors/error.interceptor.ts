import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        notify.error('Error de conexión. Verifica tu conexión a internet.');
      } else if (err.status === 403) {
        notify.error('No tienes permiso para realizar esta acción.');
      } else if (err.status === 429) {
        notify.error('Demasiadas solicitudes. Intenta más despacio.');
      } else if (err.status >= 500) {
        notify.error('Error en el servidor. Intenta de nuevo más tarde.');
      }
      return throwError(() => err);
    })
  );
};
