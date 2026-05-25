import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Radicado } from '../core/models';

@Component({
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <main class="page">
      <section class="panel">
        <h1>Mis Radicados</h1>
        <div class="actions">
          <input [(ngModel)]="filtro" placeholder="Buscar por radicado">
          <button class="btn primary" (click)="load()">Buscar</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Radicado</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Justificacion</th>
              </tr>
            </thead>
            <tbody>
              @for (item of radicados(); track item.id) {
                <tr>
                  <td>{{ item.numeroRadicado }}</td>
                  <td>{{ item.tipoPqrs }}</td>
                  <td>{{ item.fechaRadicado | date:'short' }}</td>
                  <td><span class="badge">{{ item.estado }}</span></td>
                  <td>{{ item.justificacion || 'Sin gestion registrada' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5">No se encontraron radicados.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `
})
export class ClienteHistorialComponent implements OnInit {
  filtro = '';
  radicados = signal<Radicado[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.misRadicados(this.filtro).subscribe((page) => this.radicados.set(page.content));
  }
}
