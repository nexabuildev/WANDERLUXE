import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState('...'); // Estado para el precio dinámico
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    budget: 'Lujo',
    travelers: 2
  });

  // --- EFECTO: CALCULAR PRECIO EN TIEMPO REAL ---
  // Se ejecuta cada vez que cambia formData (días, presupuesto, viajeros)
  useEffect(() => {
    const calculatePrice = async () => {
      const { days, budget, travelers } = formData;
      if (days <= 0 || travelers <= 0) {
          setPrice('N/A');
          return;
      }
      
      setPrice('Calculando...');
      try {
        // Llamamos a la nueva ruta del backend para calcular el precio
        // Usamos template literals para enviar los parámetros en la URL
        const response = await fetch(`${API_URL}/api/price?days=${days}&budget=${budget}&travelers=${travelers}`);
        const data = await response.json();
        
        if (response.ok) {
          setPrice(data.price.toFixed(2));
        } else {
          setPrice('Error');
        }
      } catch (error) {
        setPrice('Error');
      }
    };
    
    // Añadimos un pequeño delay para no saturar el servidor mientras el usuario teclea
    const timer = setTimeout(() => {
        calculatePrice();
    }, 500);

    return () => clearTimeout(timer); // Limpieza del timer
  }, [formData]); // <- Dependencia: se ejecuta cuando formData cambia


  const handleChange = (e) => {
    // Manejo de números para que el precio se recalcule inmediatamente
    let value = e.target.value;
    if (e.target.name === 'days' || e.target.name === 'travelers') {
        value = parseInt(value) || 0;
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🖱️ Botón presionado. Iniciando fetch...");
    setLoading(true);

    try {
      // 1. Generar el Viaje (Backend)
      const response = await fetch(`${API_URL}/api/trips/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include' 
      });

      // Si hay error de sesión
      if (response.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        navigate('/login');
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setTimeout(() => {
          // 2. Redirigimos al Checkout
          // Pasamos el objeto de viaje (data.trip) Y el precio calculado (price)
          navigate('/checkout', { 
            state: { 
                trip: { ...data.trip, finalPrice: price } 
            } 
          }); 
        }, 1000);
      } else {
        alert("Error: " + (data.error || "No se pudo generar el viaje"));
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxe-black text-luxe-white font-sans p-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black z-0"></div>

      <div className="w-full max-w-2xl z-10">
        <h2 className="text-5xl font-serif text-center mb-2 text-luxe-gold">Diseña tu Experiencia</h2>
        <p className="text-center text-gray-400 mb-12">Cuéntanos tus deseos, nuestra IA se encarga del resto.</p>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl space-y-8">
          
          <div>
            <label className="block text-sm uppercase tracking-widest text-luxe-gold mb-3">¿Cuál es tu destino soñado?</label>
            <input 
              type="text" 
              name="destination"
              onChange={handleChange}
              placeholder="Ej: Costa Amalfitana, Italia"
              className="w-full bg-black/50 border border-white/20 rounded-xl px-6 py-4 text-xl text-white focus:outline-none focus:border-luxe-gold transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-2">Duración (Días)</label>
              <input type="number" name="days" onChange={handleChange} value={formData.days} min={1} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-luxe-gold focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-2">Estilo</label>
              <select name="budget" onChange={handleChange} value={formData.budget} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-luxe-gold focus:outline-none appearance-none">
                <option>Lujo</option><option>Aventura</option><option>Relax</option><option>Cultural</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-2">Viajeros</label>
              <input type="number" name="travelers" onChange={handleChange} value={formData.travelers} min={1} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-luxe-gold focus:outline-none"/>
            </div>
          </div>

          {/* BLOQUE DE PRECIO EN VIVO */}
          <div className="text-center pt-4 pb-2 border-t border-white/10">
            <p className="text-sm uppercase text-gray-400">Costo estimado del servicio de planificación</p>
            <p className="text-5xl font-serif font-bold text-luxe-gold mt-2">
              {price} €
            </p>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.01] shadow-xl ${loading ? 'bg-gray-600 cursor-wait' : 'bg-luxe-gold text-luxe-black hover:bg-white'}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Consultando a la IA...
              </span>
            ) : "Generar Itinerario Exclusivo"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateTrip;