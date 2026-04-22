// src/constants/config.ts
// Configuración central de conexión con Odoo.
// NUNCA escribas esta URL directamente en otros archivos.
// Si cambias de servidor, solo cambias aquí.

export const ODOO_CONFIG = {
  baseUrl: 'http://10.0.2.2:8069',
  // ⚠️ Si pruebas con Expo Go en tu celular, NO uses 'localhost'
  // porque el celular no conoce tu PC como 'localhost'.
  // Usa la IP local de tu PC, ejemplo: 'http://192.168.1.50:8069'
  // Para encontrar tu IP en Windows: abre CMD y escribe 'ipconfig'
  // Busca "Dirección IPv4"

  db: "mydb",
} as const;
