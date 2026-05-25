export type TipoPqrs = 'PETICION' | 'QUEJA' | 'RECLAMO' | 'SUGERENCIA';
export type EstadoPqrs = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'RECHAZADO';
export type Rol = 'CLIENTE' | 'GESTOR';

export interface SesionResponse {
  token: string;
  correo: string;
  rol: Rol;
  nombre: string;
}

export interface Radicado {
  id: number;
  numeroRadicado: string;
  cliente: string;
  correo: string;
  tipoPqrs: TipoPqrs;
  descripcion: string;
  estado: EstadoPqrs;
  justificacion?: string;
  fechaRadicado: string;
  fechaGestion?: string;
  rutaAnexo?: string | null;
  passwordTemporal?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
