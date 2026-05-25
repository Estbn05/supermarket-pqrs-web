import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from './models';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rol = route.data['rol'] as Rol;
  if (auth.hasRole(rol)) {
    return true;
  }
  return router.createUrlTree([rol === 'GESTOR' ? '/gestor/login' : '/cliente/login']);
};

