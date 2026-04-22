// src/types/auth.types.ts
// Tipos relacionados con autenticación y sesión del usuario.

export interface LoginCredentials {
  username: string; // Email o login de Odoo
  password: string;
}

export interface AuthUser {
  uid: number;
  name: string;
  partnerId: number;
  sessionId: string;
  db: string;
}

// Estado posible de autenticación en toda la app
export type AuthStatus =
  | 'idle'            // Estado inicial, no sabemos nada aún
  | 'loading'         // Verificando sesión o haciendo login
  | 'authenticated'   // Usuario logueado correctamente
  | 'unauthenticated' // No hay sesión
  | 'error';          // Algo salió mal