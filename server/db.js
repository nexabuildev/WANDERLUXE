const { Pool } = require('pg');
require('dotenv').config();

// Detectamos si estamos en producción (Nube) o desarrollo (Local)
const isProduction = process.env.NODE_ENV === 'production';

// En la nube, Render nos dará una variable llamada DATABASE_URL con todo junto.
// En local, seguimos usando las variables sueltas.
const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Si es una URL interna de Render (empieza por dpg- y no tiene .com), no acepta SSL.
const isRenderInternal = connectionString && connectionString.includes('dpg-') && !connectionString.includes('.com');

const pool = new Pool({
    connectionString: connectionString,
    // Las URL internas de Render cortan la conexión si intentas forzar SSL.
    ssl: (isProduction && !isRenderInternal) ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
    console.log('💎 Conexión a Base de Datos Establecida');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};