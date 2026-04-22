// src/services/odoo/authService.ts
// Servicio de autenticación con Odoo.
// Usa odooRpc internamente — nunca llama a fetch directamente.
// Separación de responsabilidades: odooClient maneja HTTP,
// authService maneja la lógica de autenticación.

import { ODOO_CONFIG } from '../../constants/config';
import { AuthUser, LoginCredentials, OdooSession } from '../../types';
import { odooRpc } from './odooClient';
// Nota: crearemos src/types/index.ts para exportar todo junto

export async function loginOdoo(
  credentials: LoginCredentials
): Promise<AuthUser> {

  const result = await odooRpc<OdooSession>(
    '/web/session/authenticate',
    {
      db: ODOO_CONFIG.db,
      login: credentials.username,
      password: credentials.password,
    }
  );

  // Odoo devuelve uid: false cuando las credenciales son incorrectas
  // En lugar de lanzar un error HTTP, devuelve 200 con uid: false
  if (!result.uid) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  // Transformamos la respuesta de Odoo a nuestro formato interno
  // Buena práctica: nunca expongas el formato crudo de la API al resto de la app
  return {
    uid: result.uid,
    name: result.name,
    partnerId: result.partner_id,
    sessionId: result.session_id,
    db: result.db,
  };
}

export async function logoutOdoo(): Promise<void> {
  await odooRpc<void>('/web/session/destroy', {});
}