import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { API_URL } from '../config/api';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Obtener usuario de localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/api/users/logout`, { method: 'POST', credentials: 'include' });
        } catch (e) {
            console.error("Error logout backend", e);
        }
        localStorage.removeItem('user');
        setIsMenuOpen(false);
        navigate('/');
    };

    const menuItems = [
        { label: 'Mi Perfil', icon: '👤', path: '/profile' },
        { label: 'Mis Viajes', icon: '✈️', path: '/my-trips' },
        { label: 'Crear Viaje', icon: '✨', path: '/create-trip' },
        { label: 'Servicios', icon: '🏨', path: '/services' },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-luxe-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <span className="text-2xl">✨</span>
                    <span className="text-xl font-serif font-bold text-gray-900 dark:text-luxe-gold group-hover:text-luxe-gold dark:group-hover:text-white transition-colors">
                        WanderLuxe
                    </span>
                </Link>

                {/* Acciones derecha */}
                <div className="flex items-center gap-4">

                    {/* Toggle de Tema */}
                    <ThemeToggle />

                    {/* Avatar con Menú Desplegable */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
                        >
                            {/* Info del usuario (oculto en móvil) */}
                            <div className="hidden md:block text-right">
                                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                                    {user.full_name || 'Usuario'}
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                    Ver menú
                                </span>
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-luxe-gold shadow-lg shadow-luxe-gold/20 group-hover:scale-105 transition-transform">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-luxe-gold to-yellow-200 flex items-center justify-center text-luxe-black font-bold">
                                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>

                            {/* Indicador de menú */}
                            <motion.svg
                                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden md:block"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        </button>

                        {/* Menú Desplegable */}
                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
                                >
                                    {/* Cabecera del menú */}
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user.full_name || 'Usuario'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email || 'email@ejemplo.com'}
                                        </p>
                                    </div>

                                    {/* Items del menú */}
                                    <div className="py-2">
                                        {menuItems.map((item, index) => (
                                            <Link
                                                key={index}
                                                to={item.path}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-luxe-gold transition-colors"
                                            >
                                                <span className="text-lg">{item.icon}</span>
                                                <span>{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Separador y Logout */}
                                    <div className="border-t border-gray-200 dark:border-white/10">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <span className="text-lg">🚪</span>
                                            <span>Cerrar Sesión</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
