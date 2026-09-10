import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trips/my-trips`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Vital: Envía tu "carnet de identidad" (cookie)
      });

      // Si el servidor dice "401 No Autorizado", es que la sesión caducó
      if (response.status === 401) {
        // Opcional: alert("Tu sesión ha expirado.");
        navigate('/login');
        return;
      }

      const data = await response.json();
      
      // Protección por si la respuesta no es un array
      if (Array.isArray(data)) {
        setTrips(data);
      } else {
        setTrips([]);
      }
      
    } catch (error) {
      console.error("Error cargando viajes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-500/30 uppercase tracking-wide">Confirmado</span>;
    }
    return <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded border border-yellow-500/30 uppercase tracking-wide">Borrador</span>;
  };

  return (
    <div className="min-h-screen bg-luxe-black text-luxe-white font-sans p-8">
      
      {/* Cabecera con navegación */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-serif text-luxe-gold">Mis Viajes</h1>
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Volver al Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxe-gold"></div>
            <span className="ml-3 text-gray-400">Recuperando historial...</span>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-xl mb-4">Aún no tienes viajes registrados.</p>
            <Link to="/create-trip" className="px-6 py-2 bg-luxe-gold text-luxe-black font-bold rounded-full hover:bg-white transition-colors">
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-luxe-gold/50 transition-colors group relative overflow-hidden">
                
                {/* Cabecera de la Tarjeta */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif text-white group-hover:text-luxe-gold transition-colors">
                      {trip.destination}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(trip.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(trip.status)}
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-300 mb-6">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Duración</span>
                    <span>{trip.days} Días</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Viajeros</span>
                    <span>{trip.travelers} Pers.</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Estilo</span>
                    <span>{trip.budget}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                  {trip.status === 'draft' ? (
                    <Link 
                      to="/checkout" 
                      state={{ trip: trip }} 
                      className="flex-1 text-center py-2 bg-luxe-gold text-luxe-black font-bold rounded-lg hover:bg-white transition-colors text-sm"
                    >
                      Completar Pago
                    </Link>
                  ) : (
                    <Link 
                      to={`/trip/${trip.id}`} 
                      className="flex-1 text-center py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/10"
                    >
                      Ver Detalles
                    </Link>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrips;