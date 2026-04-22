// src/types/index.ts
// Barrel export — exporta todos los tipos desde un solo lugar.
// Así en lugar de importar desde rutas largas:
//   import { AuthUser } from '../../types/auth.types'
// Importas desde:
//   import { AuthUser } from '../../types'

export * from './auth.types';
export * from './odoo.types';
