import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard = (expectedRole: Role): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.userRole() !== expectedRole) {
      router.navigate(['/pos']);
      return false;
    }
    return true;
  };
};
