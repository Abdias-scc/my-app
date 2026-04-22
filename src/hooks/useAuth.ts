// src/hooks/useAuth.ts
// Hook central de autenticación.
// Maneja: login, logout, verificación de sesión existente.
// Cualquier pantalla que necesite saber si el usuario está
// autenticado usa este hook.

import { useCallback, useEffect, useState } from 'react';
import { loginOdoo, logoutOdoo } from '../services/odoo/authService';
import { sessionStorage } from '../services/odoo/sessionStorage';
import { AuthStatus, AuthUser, LoginCredentials } from '../types';
import { logger } from '../utils/logger';

// Lo que devuelve el hook — contrato con las pantallas
interface UseAuthReturn {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Al montar el hook, verificamos si ya hay sesión guardada
  // Esto permite que el usuario no tenga que loguearse cada vez
  // que abre la app
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    setStatus('loading');
    try {
      const savedUser = await sessionStorage.get();
      if (savedUser) {
        setUser(savedUser);
        setStatus('authenticated');
        logger.log('Session restored', { uid: savedUser.uid });
      } else {
        setStatus('unauthenticated');
      }
    } catch {
      setStatus('unauthenticated');
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    // useCallback evita que esta función se recree en cada render
    // Importante para performance cuando se pasa como prop
    setStatus('loading');
    setError(null);

    try {
      const authUser = await loginOdoo(credentials);
      await sessionStorage.save(authUser);
      setUser(authUser);
      setStatus('authenticated');
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Error de conexión con el servidor';
      setError(message);
      setStatus('error');
      logger.error('Login failed', err);
    }
  }, []);

  const logout = useCallback(async () => {
    setStatus('loading');
    try {
      await logoutOdoo();
    } catch {
      // Si falla el logout en Odoo, igual limpiamos localmente
      // El usuario no debe quedar atrapado en la app por un error de red
      logger.warn('Odoo logout failed, clearing local session anyway');
    } finally {
      await sessionStorage.clear();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  return { user, status, error, login, logout };
}