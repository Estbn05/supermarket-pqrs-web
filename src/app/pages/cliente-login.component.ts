import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-cliente-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="page layout">
      <section class="panel">
        <h1>Ingreso Cliente</h1>
        <p class="muted">Usa el correo y la clave temporal recibida en la confirmacion de radicacion.</p>
      </section>
      <section class="panel">
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <div class="field full">
            <label>Correo</label>
            <input type="email" formControlName="correo">
          </div>
          <div class="field full">
            <label>Contrasena</label>
            <input type="password" formControlName="password">
          </div>
          <div class="actions field full">
            <button class="btn primary" [disabled]="form.invalid || loading()">Ingresar</button>
          </div>
        </form>
        @if (message()) {
          <div class="notice error">{{ message() }}</div>
        }
      </section>
    </main>
  `
})
export class ClienteLoginComponent {
  form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = signal(false);
  message = signal('');

  constructor(private fb: FormBuilder, private api: ApiService, private auth: AuthService, private router: Router) {}

  submit(): void {
    this.loading.set(true);
    const value = this.form.getRawValue();
    this.api.loginCliente(value.correo, value.password).subscribe({
      next: (session) => {
        this.auth.save(session);
        void this.router.navigateByUrl('/cliente/historial');
      },
      error: (err) => {
        this.message.set(err.error?.mensaje ?? 'Correo o contrasena incorrectos.');
        this.loading.set(false);
      }
    });
  }
}
