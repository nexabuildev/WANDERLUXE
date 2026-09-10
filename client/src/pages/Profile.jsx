import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ id: '', full_name: '', email: '', avatar: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [avatarColor, setAvatarColor] = useState('from-luxe-gold to-yellow-200');

  useEffect(() => {
    // Cargar perfil fresco del servidor para asegurar que vemos la foto actual
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/profile`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } else {
          // Si falla (ej: no hay sesión), intentamos leer de memoria o redirigir
          const stored = localStorage.getItem('user');
          if (stored) setUser(JSON.parse(stored));
          else navigate('/login');
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/users/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error("Error logout backend", e);
    }

    localStorage.removeItem('user');
    alert("Has cerrado sesión correctamente.");
    navigate('/');
  };

  // Función para leer el archivo de imagen y convertirlo a Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Actualizamos el estado con la imagen en base64
        setUser({ ...user, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (!isEditing) return;
    // Solo cambia el color si no hay imagen de avatar
    if (!user.avatar) {
      const colors = [
        'from-luxe-gold to-yellow-200',
        'from-purple-600 to-blue-500',
        'from-green-500 to-emerald-700',
        'from-red-500 to-orange-500'
      ];
      const random = colors[Math.floor(Math.random() * colors.length)];
      setAvatarColor(random);
    }
  };

  const handleSave = async () => {
    if (passwords.new && passwords.new !== passwords.confirm) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, password: passwords.new }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setPasswords({ new: '', confirm: '' });
        setIsEditing(false);
        alert("✨ Perfil actualizado correctamente");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-luxe-cream dark:bg-luxe-black text-gray-900 dark:text-luxe-white font-sans p-8 flex justify-center items-center relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 dark:from-black via-gray-50 dark:via-gray-900 to-amber-50/20 dark:to-purple-900/20 z-0"></div>

      <div className="w-full max-w-2xl z-10 bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl">

        {/* Cabecera */}
        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-serif text-luxe-gold">Mi Perfil</h1>
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Volver al Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-start">

          {/* Avatar Interactivo con Subida de Foto */}
          <div className="flex flex-col items-center gap-4">
            <div
              onClick={handleAvatarClick}
              className={`w-32 h-32 rounded-full overflow-hidden border-4 border-luxe-gold shadow-lg shadow-luxe-gold/20 relative group ${isEditing ? 'cursor-pointer' : ''}`}
            >
              {/* Si hay avatar (foto), lo mostramos. Si no, mostramos iniciales con color */}
              {user.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-4xl font-bold text-luxe-black`}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                </div>
              )}

              {/* Overlay para subir foto (Solo en modo edición) */}
              {isEditing && (
                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="font-bold mb-1">CAMBIAR FOTO</span>
                  <span className="text-[10px] text-gray-300">(Clic aquí)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-widest text-center">
              Miembro WanderLuxe<br />ID: {user.id}
            </div>
          </div>

          {/* Formulario de Datos */}
          <div className="flex-1 w-full space-y-6">

            <div>
              <label className="block text-xs uppercase text-gray-500 mb-2">Nombre Completo</label>
              {isEditing ? (
                <input type="text" value={user.full_name} onChange={(e) => setUser({ ...user, full_name: e.target.value })} className="w-full bg-black/50 border border-luxe-gold rounded-lg p-3 text-white focus:outline-none" />
              ) : (
                <div className="text-xl font-medium text-white border-b border-white/10 pb-2">{user.full_name}</div>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-500 mb-2">Correo Electrónico</label>
              {isEditing ? (
                <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} className="w-full bg-black/50 border border-luxe-gold rounded-lg p-3 text-white focus:outline-none" />
              ) : (
                <div className="text-xl font-medium text-gray-300 border-b border-white/10 pb-2">{user.email}</div>
              )}
            </div>

            {/* SECCIÓN DE SEGURIDAD */}
            <div className="pt-4 border-t border-white/10 mt-4">
              <h3 className="text-luxe-gold font-serif text-sm mb-4">Seguridad</h3>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Nueva Contraseña"
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white text-sm focus:border-luxe-gold focus:outline-none"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="Confirmar Contraseña"
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white text-sm focus:border-luxe-gold focus:outline-none"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <span>••••••••••••••••</span>
                  <span className="text-xs border border-white/20 px-2 py-1 rounded text-gray-400">Protegida</span>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="pt-6 flex flex-wrap gap-4">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="flex-1 px-6 py-2 bg-luxe-gold text-luxe-black font-bold rounded-lg hover:bg-white transition-colors shadow-lg">Guardar Cambios</button>
                  <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors text-gray-300">Cancelar</button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="flex-1 px-6 py-2 border border-luxe-gold text-luxe-gold rounded-lg hover:bg-luxe-gold/10 transition-colors font-medium">Editar Perfil</button>
                  <button onClick={handleLogout} className="px-6 py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/50 transition-colors text-sm">Cerrar Sesión</button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;