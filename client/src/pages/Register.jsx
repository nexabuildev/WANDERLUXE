import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      alert('¡Bienvenido a WanderLuxe! Cuenta creada con éxito.');
      navigate('/login'); // Vamos al login para que se genere la cookie correctamente
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxe-black text-luxe-white relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-luxe-gold opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl z-10">
        <h2 className="text-4xl font-serif text-center mb-2 text-luxe-gold">Unirse al Club</h2>
        <p className="text-center text-gray-400 mb-8 text-sm tracking-widest uppercase">Comienza tu viaje exclusivo</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Nombre Completo</label>
            <input type="text" name="fullName" onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxe-gold transition-colors" placeholder="Ej. Ana García" required />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Correo Electrónico</label>
            <input type="email" name="email" onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxe-gold transition-colors" placeholder="ana@ejemplo.com" required />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Contraseña</label>
            <input type="password" name="password" onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxe-gold transition-colors" placeholder="••••••••" required />
          </div>

          <button type="submit" className="w-full py-3 bg-luxe-gold text-luxe-black font-bold rounded-lg hover:bg-yellow-400 transition-all transform hover:scale-[1.02] shadow-lg shadow-yellow-900/50">
            Crear Cuenta
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-400">
          ¿Ya eres miembro?{' '}
          <Link to="/login" className="text-luxe-gold hover:underline">Iniciar Sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;