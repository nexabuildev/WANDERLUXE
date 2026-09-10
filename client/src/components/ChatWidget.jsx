import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config/api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // 1. CARGAR HISTORIAL AL INICIAR
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/history`, {
          credentials: 'include' // Obligatorio: Envía la cookie de sesión
        });

        // Si la sesión ha expirado, el backend devuelve 401. El fetchHistory fallará, pero no paramos el chat.
        if (response.ok) {
          const history = await response.json();
          if (history.length > 0) {
            setMessages(history);
          } else {
            setMessages([{ text: "¡Hola! Soy WanderBot 🤖. ¿En qué puedo ayudarte?", sender: 'ai' }]);
          }
        }
      } catch (error) {
        console.error("Error cargando historial del chat", error);
      }
    };

    fetchHistory();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { text: input, sender: 'user' };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text }), 
        credentials: 'include' // Obligatorio: Envía la cookie de sesión
      });
      
      // El backend enviará la respuesta ya guardada en la base de datos
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { text: data.reply, sender: 'ai' }]);
      } else {
        // Si hay error (ej: 401), el mensaje de error del backend ya vendrá en 'data.error'
        setMessages(prev => [...prev, { text: "Error: No pude procesar tu mensaje.", sender: 'ai' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: "Error de conexión con la IA", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* VENTANA DEL CHAT */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-luxe-black border border-luxe-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] animate-fade-in-up">
          {/* Cabecera */}
          <div className="bg-luxe-gold p-4 flex items-center gap-3 shadow-md">
            <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-pulse"></div>
            <div>
                <h3 className="font-serif text-luxe-black font-bold text-lg leading-none">WanderBot</h3>
                <span className="text-xs text-luxe-black/70 font-sans uppercase tracking-wider">Concierge IA</span>
            </div>
          </div>

          {/* Cuerpo Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/80 backdrop-blur-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-luxe-gold text-luxe-black rounded-tr-none font-medium' 
                    : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  </div>
              </div>
            )}
            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2 items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-1 bg-gray-800 border-none text-white text-sm rounded-full px-4 py-2 focus:ring-2 focus:ring-luxe-gold focus:outline-none placeholder-gray-500 transition-all"
            />
            <button 
                type="submit" 
                disabled={loading || !input.trim()} 
                className="w-10 h-10 bg-luxe-gold text-luxe-black rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN FLOTANTE */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-luxe-gold rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 hover:bg-white transition-all duration-300 text-luxe-black text-2xl z-50"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default ChatWidget;