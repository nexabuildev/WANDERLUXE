import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Mapas
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// Animaciones
import { Reveal } from '../components/Reveal'; // <--- IMPORTANTE: Animaciones al hacer scroll
import { API_URL } from '../config/api';

// Configuración del icono del mapa
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const TripDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(`${API_URL}/api/trips/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' 
        });

        if (response.status === 401) {
          alert("Sesión expirada. Por favor, identifícate.");
          navigate('/login');
          return;
        }

        const data = await response.json();
        
        if (response.ok) {
          setTrip(data);
        } else {
          alert("Error: " + (data.error || "No se pudo cargar el viaje"));
        }
      } catch (error) {
        console.error("Error conexión:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen bg-luxe-black flex items-center justify-center text-luxe-gold">Cargando experiencia...</div>;
  
  if (!trip) return (
    <div className="min-h-screen bg-luxe-black flex flex-col items-center justify-center text-white gap-4">
      <p>Viaje no encontrado o acceso denegado.</p>
      <Link to="/my-trips" className="text-luxe-gold underline">Volver a mis viajes</Link>
    </div>
  );

  const itinerary = trip.trip_data;
  
  // Coordenadas: Si la IA falla o es un viaje antiguo, usamos París por defecto
  const coords = itinerary.coordinates && itinerary.coordinates.lat 
    ? [itinerary.coordinates.lat, itinerary.coordinates.lng] 
    : [48.8566, 2.3522]; 

  return (
    <div className="min-h-screen bg-luxe-black text-luxe-white font-sans p-8">
      
      {/* Cabecera */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link to="/my-trips" className="text-gray-400 hover:text-white transition-colors text-sm mb-4 block">← Volver</Link>
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif text-luxe-gold mb-2">{trip.destination}</h1>
            <p className="text-xl text-gray-300 font-light">{itinerary.title}</p>
          </div>
          <div className="text-right hidden md:block">
             {trip.status === 'paid' ? 
                <span className="text-green-400 font-bold border border-green-400 px-3 py-1 rounded tracking-widest text-xs">CONFIRMADO</span> : 
                <span className="text-yellow-400 font-bold border border-yellow-400 px-3 py-1 rounded tracking-widest text-xs">BORRADOR</span>
             }
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: MAPA Y DATOS */}
        <div className="md:col-span-1 space-y-6">
          
          {/* MAPA INTERACTIVO */}
          <div className="bg-white/5 p-2 rounded-2xl border border-white/10 shadow-lg overflow-hidden h-[300px] relative z-0">
            <MapContainer center={coords} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%", borderRadius: "1rem" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <Marker position={coords}>
                <Popup>{trip.destination}</Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* RESUMEN */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-luxe-gold font-serif text-lg mb-4">Resumen</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Duración</span> <span className="text-white">{trip.days} Días</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Viajeros</span> <span className="text-white">{trip.travelers}</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>Estilo</span> <span className="text-white">{trip.budget}</span></li>
            </ul>
          </div>

          {/* ENLACES A SERVICIOS (Nuevo) */}
          <div className="bg-luxe-gold/10 p-6 rounded-2xl border border-luxe-gold/30">
            <h3 className="text-luxe-gold font-serif text-lg mb-4">Complementa tu Viaje</h3>
            <div className="space-y-3">
                <Link to="/services" className="block w-full py-2 bg-white/10 hover:bg-luxe-gold hover:text-luxe-black text-center rounded transition-colors text-sm">
                    🏨 Buscar Hoteles
                </Link>
                <Link to="/services" className="block w-full py-2 bg-white/10 hover:bg-luxe-gold hover:text-luxe-black text-center rounded transition-colors text-sm">
                    🚗 Alquilar Vehículo
                </Link>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ITINERARIO CON ANIMACIÓN */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-2xl font-serif mb-4">Agenda Exclusiva</h3>
          
          {itinerary.dailyPlan && itinerary.dailyPlan.map((day, index) => (
            <Reveal key={index} delay={index * 0.1}>
                <div className="relative pl-8 border-l border-luxe-gold/30 pb-8 last:pb-0 group">
                <div className="absolute top-0 left-[-5px] w-2.5 h-2.5 bg-luxe-gold rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-default hover:border-luxe-gold/50">
                    <h4 className="text-xl font-bold text-white mb-2 font-serif">Día {day.day}</h4>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {day.activity}
                    </p>
                    <div className="mt-4 flex gap-2">
                    <span className="px-2 py-1 bg-black/30 rounded text-xs text-gray-500 uppercase tracking-wider">Mañana</span>
                    <span className="px-2 py-1 bg-black/30 rounded text-xs text-gray-500 uppercase tracking-wider">Tarde</span>
                    <span className="px-2 py-1 bg-black/30 rounded text-xs text-gray-500 uppercase tracking-wider">Noche</span>
                    </div>
                </div>
                </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripDetails;