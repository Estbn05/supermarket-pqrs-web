import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Rol, SesionResponse } from './models';

const STORAGE_KEY = 'pqrs-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  session = signal<SesionResponse | null>(this.readSession());

  constructor(private router: Router) {}

  save(session: SesionResponse): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.session.set(session);
  }

  token(): string | null {
    return this.session()?.token ?? null;
  }

  hasRole(rol: Rol): boolean {
    return this.session()?.rol === rol;
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.session.set(null);
    void this.router.navigateByUrl('/cliente/radicar');
  }

  private readSession(): SesionResponse | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as SesionResponse : null;
  }
}

