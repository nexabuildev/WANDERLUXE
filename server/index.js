const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./db');
require('dotenv').config();

// 1. IMPORTAR RUTAS
const authRoutes = require('./src/routes/authRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const userRoutes = require('./src/routes/userRoutes');
const priceRoutes = require('./src/routes/priceRoutes'); // <--- NUEVO: Rutas de precio

const app = express();
const PORT = process.env.PORT || 3000;

// CONFIGURACIÓN DE PROXY (Necesario para Render y express-rate-limit)
app.set('trust proxy', 1);

// CONFIGURACIÓN CORS
// CLIENT_URL admite una o varias URLs separadas por coma (ej: dominio de Cloudflare Pages).
// Si no se define (desarrollo local), se permite cualquier origen como antes.
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('No permitido por CORS'));
    },
    credentials: true
}));

// --- CAMBIO AQUÍ: AUMENTAMOS EL LÍMITE A 50MB ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// -----------------------------------------------

app.use(cookieParser());

// 3. ACTIVAR LAS RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/price', priceRoutes); // <--- NUEVO: Activamos la ruta de precios

// Ruta base de prueba (Útil para saber si Render ha arrancado bien)
app.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            message: '🥂 Backend WanderLuxe Operativo en la Nube',
            time: result.rows[0].now
        });
    } catch (err) {
        console.error("Error en BD:", err);
        res.status(500).json({ error: 'Error conectando a la base de datos' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});