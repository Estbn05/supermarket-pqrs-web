import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { EstadoPqrs, Radicado, TipoPqrs } from '../core/models';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="page">
      <section class="panel">
        <h1>Panel Gestor PQRS</h1>
        <div class="actions">
          <select [(ngModel)]="tipo">
            <option value="">Todos los tipos</option>
            <option value="PETICION">Peticion</option>
            <option value="QUEJA">Queja</option>
            <option value="RECLAMO">Reclamo</option>
            <option value="SUGERENCIA">Sugerencia</option>
          </select>
          <select [(ngModel)]="estado">
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_REVISION">En revision</option>
            <option value="RESUELTO">Resuelto</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
          <button class="btn primary" (click)="load()">Filtrar</button>
          <button class="btn" (click)="downloadReporte()">Reporte PDF</button>
        </div>
        <p class="muted">{{ total() }} registros encontrados</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Radicado</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Descripcion</th>
                <th>Justificacion</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (item of radicados(); track item.id) {
                <tr>
                  <td>{{ item.numeroRadicado }}</td>
                  <td>{{ item.cliente }}<br><span class="muted">{{ item.correo }}</span></td>
                  <td>{{ item.tipoPqrs }}</td>
                  <td><span class="badge">{{ item.estado }}</span></td>
                  <td class="description-cell">{{ item.descripcion }}</td>
                  <td>{{ item.justificacion || 'Pendiente de gestion' }}</td>
                  <td>
                    <button class="btn" (click)="select(item)">Gestionar</button>
                    <button class="btn" [disabled]="!item.rutaAnexo" (click)="downloadAnexo(item)">
                      {{ item.rutaAnexo ? 'Anexo' : 'Sin anexo' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7">No hay resultados para los filtros seleccionados.</td></tr>
              }
            </tbody>
          </table>
        </div>
        @if (anexoMessage()) {
          <div class="notice" [class.error]="anexoError()">{{ anexoMessage() }}</div>
        }
      </section>

      @if (selected()) {
        <section class="panel" style="margin-top: 18px">
          <h2>Cambiar estado: {{ selected()?.numeroRadicado }}</h2>
          <p class="muted"><strong>Descripcion:</strong> {{ selected()?.descripcion }}</p>
          <div class="form-grid">
            <div class="field">
              <label>Nuevo estado</label>
              <select [(ngModel)]="nuevoEstado">
                <option value="EN_REVISION">En revision</option>
                <option value="RESUELTO">Resuelto</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div>
            <div class="field full">
              <label>Justificacion</label>
              <textarea [(ngModel)]="justificacion"></textarea>
            </div>
          </div>
          <div class="actions">
            <button class="btn primary" (click)="saveEstado()">Guardar cambio</button>
            <button class="btn" (click)="selected.set(null)">Cancelar</button>
          </div>
          @if (message()) {
            <div class="notice" [class.error]="error()">{{ message() }}</div>
          }
        </section>
      }
    </main>
  `
})
export class GestorPanelComponent implements OnInit {
  tipo: '' | TipoPqrs = '';
  estado: '' | EstadoPqrs = '';
  nuevoEstado: EstadoPqrs = 'EN_REVISION';
  justificacion = '';
  total = signal(0);
  radicados = signal<Radicado[]>([]);
  selected = signal<Radicado | null>(null);
  message = signal('');
  error = signal(false);
  anexoMessage = signal('');
  anexoError = signal(false);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.anexoMessage.set('');
    this.anexoError.set(false);
    this.api.listado(this.tipo, this.estado).subscribe((page) => {
      this.radicados.set(page.content);
      this.total.set(page.totalElements);
    });
  }

  select(item: Radicado): void {
    this.selected.set(item);
    this.nuevoEstado = item.estado === 'PENDIENTE' ? 'EN_REVISION' : item.estado;
    this.justificacion = item.justificacion ?? '';
    this.message.set('');
    this.error.set(false);
  }

  saveEstado(): void {
    const item = this.selected();
    if (!item) {
      return;
    }
    if (this.justificacion.trim().length < 20) {
      this.error.set(true);
      this.message.set('La justificacion debe tener minimo 20 caracteres.');
      return;
    }
    this.api.cambiarEstado(item.id, this.nuevoEstado, this.justificacion).subscribe(() => {
      this.selected.set(null);
      this.justificacion = '';
      this.error.set(false);
      this.message.set('');
      this.load();
    }, (err) => {
      this.error.set(true);
      this.message.set(err.error?.mensaje ?? 'No fue posible cambiar el estado.');
    });
  }

  downloadAnexo(item: Radicado): void {
    if (!item.rutaAnexo) {
      this.anexoError.set(true);
      this.anexoMessage.set('Este radicado no tiene anexo disponible.');
      return;
    }
    this.api.descargarAnexo(item.id).subscribe((blob) => {
      this.anexoError.set(false);
      this.anexoMessage.set('');
      this.saveBlob(blob, `anexo-${item.numeroRadicado}.pdf`);
    }, () => {
      this.anexoError.set(true);
      this.anexoMessage.set('No fue posible descargar el anexo de este radicado.');
    });
  }

  downloadReporte(): void {
    this.api.reporte(this.tipo, this.estado).subscribe((blob) => this.saveBlob(blob, 'Reporte_PQRS.pdf'));
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
