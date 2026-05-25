import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="page layout">
      <section class="panel">
        <h1>Radicar PQRS</h1>
        <p class="muted">Registra una peticion, queja, reclamo o sugerencia con soporte PDF.</p>
        <div class="notice">Al finalizar se genera un numero de radicado y se envia la clave temporal al correo.</div>
      </section>

      <section class="panel">
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <div class="field">
            <label>Tipo</label>
            <select formControlName="tipoPqrs">
              <option value="PETICION">Peticion</option>
              <option value="QUEJA">Queja</option>
              <option value="RECLAMO">Reclamo</option>
              <option value="SUGERENCIA">Sugerencia</option>
            </select>
          </div>
          <div class="field">
            <label>Identificacion</label>
            <input formControlName="numeroId" maxlength="10">
          </div>
          <div class="field">
            <label>Nombres</label>
            <input formControlName="nombres" maxlength="100">
          </div>
          <div class="field">
            <label>Apellidos</label>
            <input formControlName="apellidos" maxlength="100">
          </div>
          <div class="field">
            <label>Correo</label>
            <input formControlName="correo" type="email">
          </div>
          <div class="field">
            <label>Telefono</label>
            <input formControlName="telefono" maxlength="10">
          </div>
          <div class="field full">
            <label>Descripcion</label>
            <textarea formControlName="descripcion" maxlength="500"></textarea>
          </div>
          <div class="field full">
            <label>Anexo PDF</label>
            <input #archivoInput type="file" accept="application/pdf" (change)="onFile($event)" required>
          </div>
          <div class="actions field full">
            <button class="btn primary" [disabled]="loading()">Radicar PQRS</button>
            <a class="btn" routerLink="/cliente/login">Consultar radicados</a>
          </div>
        </form>
        @if (message()) {
          <div class="notice" [class.error]="error()">{{ message() }}</div>
        }
      </section>
    </main>
  `
})
export class ClienteRadicarComponent {
  @ViewChild('archivoInput') archivoInput?: ElementRef<HTMLInputElement>;

  form = this.fb.nonNullable.group({
    tipoPqrs: ['PETICION', Validators.required],
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    numeroId: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    descripcion: ['', [Validators.required, Validators.maxLength(500)]]
  });
  archivo = signal<File | null>(null);
  loading = signal(false);
  message = signal('');
  error = signal(false);

  constructor(private fb: FormBuilder, private api: ApiService) {}

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && !this.isValidPdf(file)) {
      this.archivo.set(null);
      input.value = '';
      this.error.set(true);
      this.message.set('El archivo adjunto no es valido. Solo se aceptan archivos PDF de maximo 5 MB.');
      return;
    }
    this.archivo.set(file);
    this.message.set(file ? `Archivo seleccionado: ${file.name}` : '');
    this.error.set(false);
  }

  canSubmit(): boolean {
    return this.form.valid && !!this.getSelectedFile() && !this.loading();
  }

  submit(): void {
    const file = this.getSelectedFile();
    if (file && !this.isValidPdf(file)) {
      this.error.set(true);
      this.message.set('El archivo adjunto no es valido. Solo se aceptan archivos PDF de maximo 5 MB.');
      return;
    }
    if (!this.canSubmit()) {
      this.error.set(true);
      this.message.set('Completa todos los campos y selecciona un PDF antes de radicar.');
      return;
    }
    const body = new FormData();
    const values = this.form.getRawValue();
    Object.entries(values).forEach(([key, value]) => body.append(key, value));
    body.append('tipo_pqrs', this.tipoParaApi(values.tipoPqrs));
    body.append('numero_id', values.numeroId);
    body.append('archivo', file as File);
    body.append('anexo', file as File);
    this.loading.set(true);
    this.api.radicar(body).subscribe({
      next: (radicado) => {
        this.error.set(false);
        const clave = radicado.passwordTemporal ? ` Clave temporal: ${radicado.passwordTemporal}.` : '';
        this.message.set(`Su PQRS fue radicada exitosamente. Radicado: ${radicado.numeroRadicado}.${clave}`);
        this.loading.set(false);
        this.form.reset({ tipoPqrs: 'PETICION', nombres: '', apellidos: '', numeroId: '', correo: '', telefono: '', descripcion: '' });
        this.archivo.set(null);
        if (this.archivoInput) {
          this.archivoInput.nativeElement.value = '';
        }
      },
      error: (err) => {
        this.error.set(true);
        this.message.set(err.error?.mensaje ?? 'No fue posible radicar la PQRS.');
        this.loading.set(false);
      }
    });
  }

  private getSelectedFile(): File | null {
    return this.archivo() ?? this.archivoInput?.nativeElement.files?.[0] ?? null;
  }

  private isValidPdf(file: File): boolean {
    return file.name.toLowerCase().endsWith('.pdf') && file.size <= 5 * 1024 * 1024;
  }

  private tipoParaApi(tipo: string): string {
    const labels: Record<string, string> = {
      PETICION: 'Petición',
      QUEJA: 'Queja',
      RECLAMO: 'Reclamo',
      SUGERENCIA: 'Sugerencia'
    };
    return labels[tipo] ?? tipo;
  }
}
