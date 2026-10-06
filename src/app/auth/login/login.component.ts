import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);

  readonly loginForm = this.fb.group({
    email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: this.fb.control('', { nonNullable: true, validators: [Validators.required] })
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    const success = this.authService.login(email, password);

    if (success) {
      this.errorMessage.set(null);
      this.redirectByRole();
    } else {
      this.errorMessage.set('Credenciales inválidas');
    }
  }

  private redirectByRole(): void {
    const role = this.authService.userRole();
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'vendedor') {
      this.router.navigate(['/pos']);
    }
  }
}
