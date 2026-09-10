import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); 
  const trip = state?.trip;

  // Obtenemos el precio final del estado, o usamos un valor de respaldo si no existe
  const finalPrice = trip?.finalPrice || '99.00'; 

  const [processing, setProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvc: ''
  });

  // Si alguien intenta entrar directo sin viaje, lo echamos
  if (!trip || !trip.destination) {
    return (
      <div className="min-h-screen bg-luxe-black flex items-center justify-center text-white">
        <p>No hay viaje seleccionado. <button onClick={() => navigate('/dashboard')} className="text-luxe-gold ml-2 underline">Volver</button></p>
      </div>
    );
  }

  const handleChange = (e) => {
    let val = e.target.value;
    if (e.target.name === 'number') {
        val = val.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    setCardData({ ...cardData, [e.target.name]: val });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/payments/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tripId: trip.id,
            cardHolder: cardData.holder,
            cardNumber: cardData.number
        }),
        credentials: 'include' 
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ¡Pago Completado! ID Transacción: ${data.transactionId}`);
        navigate('/dashboard'); 
      } else {
        alert("❌ Error: " + data.error);
        setProcessing(false);
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxe-black text-luxe-white font-sans p-8 flex items-center justify-center">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12">
        
        {/* COLUMNA IZQUIERDA: RESUMEN */}
        <div className="space-y-6">
          <h2 className="text-4xl font-serif text-luxe-gold mb-2">Confirmar Reserva</h2>
          <p className="text-gray-400 text-sm tracking-widest uppercase mb-8">El último paso hacia tu destino</p>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-2xl font-serif mb-4">{trip.destination}</h3>
            <div className="space-y-3 text-gray-300">
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span>Duración</span>
                    <span>{trip.days} Días</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span>Estilo</span>
                    <span>{trip.budget}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span>Viajeros</span>
                    <span>{trip.travelers} Pers.</span>
                </div>
                <div className="flex justify-between text-xl text-luxe-gold font-bold pt-2">
                    <span>Total a Pagar</span>
                    <span>{finalPrice} €</span>
                </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: TARJETA DE CRÉDITO VISUAL */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
            {/* Dibujo de la tarjeta */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 h-48 rounded-2xl mb-8 p-6 relative shadow-lg transform transition-transform hover:scale-105">
                <div className="absolute top-4 right-6 text-white/80 font-bold italic">VISA</div>
                <div className="mt-12 text-2xl font-mono tracking-widest text-white drop-shadow-md">
                    {cardData.number || '#### #### #### ####'}
                </div>
                <div className="flex justify-between mt-8">
                    <div>
                        <div className="text-xs text-white/60 uppercase">Titular</div>
                        <div className="text-sm font-bold tracking-wider text-white uppercase">{cardData.holder || 'TU NOMBRE'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-white/60 uppercase">Expira</div>
                        <div className="text-sm font-bold tracking-wider text-white">{cardData.expiry || 'MM/YY'}</div>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handlePayment} className="space-y-4">
                <input 
                    type="text" name="number" placeholder="Número de Tarjeta" maxLength="19"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-luxe-gold focus:outline-none"
                    onChange={handleChange} required
                />
                <input 
                    type="text" name="holder" placeholder="Nombre del Titular"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-luxe-gold focus:outline-none uppercase"
                    onChange={handleChange} required
                />
                <div className="flex gap-4">
                    <input 
                        type="text" name="expiry" placeholder="MM/YY" maxLength="5"
                        className="w-1/2 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-luxe-gold focus:outline-none"
                        onChange={handleChange} required
                    />
                    <input 
                        type="text" name="cvc" placeholder="CVC" maxLength="3"
                        className="w-1/2 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-luxe-gold focus:outline-none"
                        onChange={handleChange} required
                    />
                </div>

                <button 
                    type="submit" disabled={processing}
                    className={`w-full py-4 mt-4 rounded-xl font-bold text-lg transition-all shadow-lg ${processing ? 'bg-gray-600 cursor-wait' : 'bg-luxe-gold text-luxe-black hover:bg-white hover:scale-[1.02]'}`}
                >
                    {processing ? 'Contactando con el Banco...' : `Pagar ${finalPrice} €`}
                </button>

                {/* --- NUEVO: BOTÓN CANCELAR --- */}
                <button 
                    type="button" 
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm underline"
                >
                    Cancelar y pagar más tarde
                </button>
            </form>
        </div>

      </div>
    </div>
  );
};

export default Checkout;