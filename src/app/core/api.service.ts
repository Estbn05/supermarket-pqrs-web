import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { EstadoPqrs, PageResponse, Radicado, SesionResponse, TipoPqrs } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  loginCliente(correo: string, password: string): Observable<SesionResponse> {
    return this.http.post<unknown>(`${this.baseUrl}/auth/login`, { correo, password })
      .pipe(map((response) => this.normalizeSession(response, 'CLIENTE')));
  }

  loginGestor(correo: string, password: string): Observable<SesionResponse> {
    return this.http.post<unknown>(`${this.baseUrl}/auth/login-admin`, { correo, password })
      .pipe(map((response) => this.normalizeSession(response, 'GESTOR')));
  }

  radicar(form: FormData): Observable<Radicado> {
    return this.http.post<unknown>(`${this.baseUrl}/pqrs`, form)
      .pipe(map((response) => this.normalizeRadicado(response)));
  }

  misRadicados(filtro = ''): Observable<PageResponse<Radicado>> {
    let params = new HttpParams().set('size', 10).set('sort', 'fechaRadicado,desc');
    if (filtro) {
      params = params.set('radicado', filtro);
    }
    return this.http.get<unknown>(`${this.baseUrl}/pqrs/mis-radicados`, { params })
      .pipe(map((response) => this.normalizePage(response)));
  }

  listado(tipo = '', estado = ''): Observable<PageResponse<Radicado>> {
    let params = new HttpParams().set('size', 15).set('sort', 'fechaRadicado,desc');
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<unknown>(`${this.baseUrl}/admin/radicados`, { params })
      .pipe(map((response) => this.normalizePage(response)));
  }

  cambiarEstado(id: number, estado: EstadoPqrs, justificacion: string): Observable<Radicado> {
    return this.http.patch<unknown>(`${this.baseUrl}/admin/radicados/${id}/estado`, { estado, justificacion })
      .pipe(map((response) => this.normalizeRadicado(response)));
  }

  descargarAnexo(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/radicados/${id}/anexo`, { responseType: 'blob' });
  }

  reporte(tipo = '', estado = ''): Observable<Blob> {
    let params = new HttpParams();
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get(`${this.baseUrl}/admin/radicados/reporte`, { params, responseType: 'blob' });
  }

  private normalizeSession(response: unknown, fallbackRol: 'CLIENTE' | 'GESTOR'): SesionResponse {
    const raw = this.unwrap(response);
    return {
      token: String(raw['token'] ?? raw['accessToken'] ?? raw['access_token'] ?? raw['jwt'] ?? ''),
      correo: String(raw['correo'] ?? raw['email'] ?? ''),
      rol: (raw['rol'] ?? raw['role'] ?? fallbackRol) as 'CLIENTE' | 'GESTOR',
      nombre: String(raw['nombre'] ?? raw['name'] ?? raw['correo'] ?? raw['email'] ?? fallbackRol)
    };
  }

  private normalizePage(response: unknown): PageResponse<Radicado> {
    const raw = this.unwrap(response);
    const content = Array.isArray(raw)
      ? raw
      : (raw['content'] ?? raw['data'] ?? raw['radicados'] ?? raw['items'] ?? []);
    const items = Array.isArray(content) ? content.map((item) => this.normalizeRadicado(item)) : [];
    return {
      content: items,
      totalElements: Number(raw['totalElements'] ?? raw['total'] ?? items.length),
      totalPages: Number(raw['totalPages'] ?? 1),
      number: Number(raw['number'] ?? raw['page'] ?? 0),
      size: Number(raw['size'] ?? items.length)
    };
  }

  private normalizeRadicado(response: unknown): Radicado {
    const raw = this.unwrap(response);
    const cliente = this.unwrap(raw['cliente']);
    const nombres = raw['nombres'] ?? raw['cliente_nombres'] ?? cliente['nombres'] ?? '';
    const apellidos = raw['apellidos'] ?? raw['cliente_apellidos'] ?? cliente['apellidos'] ?? '';
    return {
      id: Number(raw['id'] ?? raw['idRadicado'] ?? raw['id_radicado'] ?? 0),
      numeroRadicado: String(raw['numeroRadicado'] ?? raw['idRadicadoTexto'] ?? raw['id_radicado_texto'] ?? raw['radicado'] ?? ''),
      cliente: String(raw['clienteNombre'] ?? raw['cliente_nombre'] ?? raw['cliente'] ?? `${nombres} ${apellidos}`.trim()),
      correo: String(raw['correo'] ?? raw['cliente_correo'] ?? cliente['correo'] ?? ''),
      tipoPqrs: this.normalizeTipo(raw['tipoPqrs'] ?? raw['tipo_pqrs']),
      descripcion: String(raw['descripcion'] ?? ''),
      estado: (raw['estado'] ?? 'PENDIENTE') as EstadoPqrs,
      justificacion: raw['justificacion'] ? String(raw['justificacion']) : undefined,
      fechaRadicado: String(raw['fechaRadicado'] ?? raw['fecha_radicado'] ?? ''),
      fechaGestion: raw['fechaGestion'] || raw['fecha_gestion'] ? String(raw['fechaGestion'] ?? raw['fecha_gestion']) : undefined,
      rutaAnexo: raw['rutaAnexo'] || raw['ruta_anexo'] ? String(raw['rutaAnexo'] ?? raw['ruta_anexo']) : null,
      passwordTemporal: raw['passwordTemporal'] || raw['password_temporal'] ? String(raw['passwordTemporal'] ?? raw['password_temporal']) : undefined
    };
  }

  private normalizeTipo(value: unknown): TipoPqrs {
    const normalized = String(value ?? 'PETICION')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
    if (normalized === 'PETICION' || normalized === 'QUEJA' || normalized === 'RECLAMO' || normalized === 'SUGERENCIA') {
      return normalized;
    }
    return 'PETICION';
  }

  private unwrap(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (obj['radicado'] && typeof obj['radicado'] === 'object') {
        return obj['radicado'] as Record<string, unknown>;
      }
      if (obj['user'] && obj['token']) {
        return { ...(obj['user'] as Record<string, unknown>), token: obj['token'] };
      }
      return obj;
    }
    return {};
  }
}
