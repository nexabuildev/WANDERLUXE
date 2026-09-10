const db = require('../../db');
const bcrypt = require('bcrypt'); 

// --- OBTENER PERFIL ---
const getProfile = async (req, res) => {
    const userId = req.user.id; 

    try {
        // MODIFICADO: Añadimos 'avatar' a la consulta
        const result = await db.query('SELECT id, full_name, email, role, avatar, created_at FROM users WHERE id = $1', [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar perfil' });
    }
};

// --- ACTUALIZAR PERFIL (Contraseña + Avatar) ---
const updateProfile = async (req, res) => {
    // MODIFICADO: Recibimos 'avatar' del cuerpo de la petición
    const { full_name, email, password, avatar } = req.body;
    const userId = req.user.id; 

    try {
        let query;
        let values;

        // Caso 1: El usuario quiere cambiar la contraseña
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            
            // Actualizamos nombre, email, password Y AVATAR
            query = 'UPDATE users SET full_name = $1, email = $2, password_hash = $3, avatar = $4 WHERE id = $5 RETURNING id, full_name, email, avatar, role';
            values = [full_name, email, passwordHash, avatar, userId];
        } else {
            // Caso 2: Solo actualiza datos básicos (incluyendo avatar)
            query = 'UPDATE users SET full_name = $1, email = $2, avatar = $3 WHERE id = $4 RETURNING id, full_name, email, avatar, role';
            values = [full_name, email, avatar, userId];
        }

        const result = await db.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Perfil actualizado correctamente', user: result.rows[0] });

    } catch (error) {
        console.error("Error update:", error);
        res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
};

// --- LOGOUT ---
const logout = (req, res) => {
    // Debe usar los mismos atributos con los que se creó la cookie (login/register)
    // para que el navegador la reconozca y la borre correctamente.
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/'
    });
    res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = { getProfile, updateProfile, logout };