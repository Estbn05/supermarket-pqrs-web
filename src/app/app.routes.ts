import { Routes } from '@angular/router';
import { GestorLoginComponent } from './pages/gestor-login.component';
import { GestorPanelComponent } from './pages/gestor-panel.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'gestor/login' },
  { path: 'gestor/login', component: GestorLoginComponent },
  { path: 'gestor/panel', component: GestorPanelComponent, canActivate: [authGuard], data: { rol: 'GESTOR' } },
  { path: '**', redirectTo: 'gestor/login' }
];
