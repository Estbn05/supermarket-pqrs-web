import { Routes } from '@angular/router';
import { ClienteRadicarComponent } from './pages/cliente-radicar.component';
import { ClienteLoginComponent } from './pages/cliente-login.component';
import { ClienteHistorialComponent } from './pages/cliente-historial.component';
import { GestorLoginComponent } from './pages/gestor-login.component';
import { GestorPanelComponent } from './pages/gestor-panel.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cliente/radicar' },
  { path: 'cliente/radicar', component: ClienteRadicarComponent },
  { path: 'cliente/login', component: ClienteLoginComponent },
  { path: 'cliente/historial', component: ClienteHistorialComponent, canActivate: [authGuard], data: { rol: 'CLIENTE' } },
  { path: 'gestor/login', component: GestorLoginComponent },
  { path: 'gestor/panel', component: GestorPanelComponent, canActivate: [authGuard], data: { rol: 'GESTOR' } },
  { path: '**', redirectTo: 'cliente/radicar' }
];

