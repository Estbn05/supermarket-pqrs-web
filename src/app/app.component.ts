import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <span class="brand-mark">SM</span>
          <span>Sistema PQRS SuperMarket</span>
        </div>
        <nav class="nav-links">
          <a routerLink="/cliente/radicar" routerLinkActive="active">Radicar</a>
          <a routerLink="/cliente/login" routerLinkActive="active">Cliente</a>
          <a routerLink="/gestor/login" routerLinkActive="active">Gestor</a>
        </nav>
      </header>
      <router-outlet />
    </div>
  `
})
export class AppComponent {}

