# WanderLuxe

Planificador de viajes con mapa interactivo y un asistente de IA que genera itinerarios completos a partir de una simple frase.

WanderLuxe es una aplicación full-stack pensada como concierge de viajes: el usuario dice a dónde quiere ir, cuántos días, con cuántas personas y con qué estilo, y la IA devuelve un itinerario día a día con coordenadas reales para verlo sobre un mapa. Todo queda guardado en una cuenta con autenticación propia, para poder volver a consultarlo cuando haga falta.

## Por qué lo hice

Cada vez que he planificado un viaje he acabado con quince pestañas abiertas: una para vuelos, otra para el blog de turno con "los 10 sitios que no puedes perderte", otra para intentar situar esos sitios en un mapa a mano. La información está ahí fuera, pero dispersa y en formato de lista plana, que es la peor forma de entender cómo se mueve alguien por una ciudad durante varios días.

Quería construir algo que resolviera ese problema concreto: pedir un itinerario en lenguaje natural y verlo directamente sobre un mapa, no como una lista de texto. Por eso el mapa interactivo no es un adorno, es el motivo del proyecto. Y me pareció el caso de uso perfecto para meterle IA generativa de verdad, no como etiqueta de marketing, sino como pieza que hace un trabajo concreto: interpretar la petición del usuario y devolver datos estructurados (título, plan por días, puntos destacados y coordenadas) que el resto de la aplicación pueda usar sin tener que parsear texto libre.

También quería que el proyecto tuviera las partes "aburridas" de un producto real: cuentas de usuario con contraseñas bien guardadas, sesiones con JWT, protección contra fuerza bruta en el login y una base de datos relacional detrás. Es la parte que no se ve en una demo rápida pero que marca la diferencia entre un experimento y algo que podría sostenerse en producción.

## Qué hace

- **Registro y login** con contraseña cifrada (bcrypt) y sesión mantenida en una cookie con JWT firmado.
- **Generación de itinerarios con IA**: el usuario rellena destino, días, presupuesto y viajeros; el backend llama a Gemini (`@google/genai`) con un esquema de respuesta forzado (`responseSchema`) para que siempre devuelva JSON con título, descripción, plan día a día, puntos destacados y coordenadas del destino.
- **Mapa interactivo del viaje**: cada itinerario se muestra en un mapa (React Leaflet) centrado en las coordenadas que devuelve la IA, con marcador sobre el destino.
- **Chat con memoria de contexto**: un asistente conversacional que primero decide, con una llamada a la IA, si el mensaje es una orden para crear un viaje nuevo o una pregunta de seguimiento; si es lo segundo, responde usando como contexto el último viaje guardado del usuario. El historial se persiste en base de datos.
- **Historial de viajes**: listado de viajes propios y vista de detalle por viaje, protegidos para que cada usuario solo vea los suyos.
- **Cálculo de precio en vivo**: al rellenar el formulario de creación, el precio estimado se recalcula en tiempo real contra un endpoint del backend según días, viajeros y estilo elegido.
- **Checkout simulado**: flujo de pago de prueba que marca el viaje como pagado (sin pasarela real).
- **Sección de servicios**: catálogo de hoteles y vehículos con datos de muestra, pensado como ampliación futura hacia proveedores reales.
- **Perfil de usuario**: edición de nombre, email, avatar y contraseña.

## Decisiones técnicas

- **Monorepo con `client/` y `server/` separados, orquestados con `concurrently`**: cliente y servidor son responsabilidades distintas (interfaz vs. API), pero mantenerlos en el mismo repo simplifica el desarrollo diario. `concurrently` levanta ambos con un único `npm run dev` sin renunciar a que cada uno tenga su propio `package.json` y ciclo de vida.
- **React Leaflet en vez de una solución de mapas cerrada**: es open source, no depende de una clave de API de pago para lo básico y encaja mejor con un proyecto pensado para poder desplegarse sin coste. Al final lo que necesitaba era centrar un mapa en unas coordenadas y poner un marcador, y Leaflet lo hace sin complicaciones.
- **PostgreSQL con `pg` directo, sin ORM**: con el número de tablas y consultas que tiene esta app (usuarios, viajes, mensajes), un ORM habría añadido una capa de abstracción sin aportar mucho. Escribir el SQL a mano me obligó a entender bien qué estaba pidiendo a la base de datos en cada endpoint, que es justo lo que quería aprender bien en este proyecto.
- **JWT en cookie httpOnly + bcrypt para auth**: la contraseña nunca se guarda ni se compara en texto plano (bcrypt con salt), y la sesión viaja en una cookie `httpOnly`/`sameSite` en vez de en `localStorage`, para que un script malicioso en el navegador no pueda leer el token directamente.
- **Gemini con `responseSchema` en vez de parsear texto libre**: en lugar de pedirle a la IA una respuesta en prosa y luego intentar extraer los datos con expresiones regulares, la llamada a `@google/genai` fuerza un JSON con una forma concreta (día, actividad, coordenadas numéricas). Esto hace que el resto del backend pueda confiar en la estructura de la respuesta sin lógica extra de parseo, y que si la IA falla, sea fácil detectarlo y devolver un itinerario de respaldo en vez de romper la petición.
- **Rate limiting en login y registro**: `express-rate-limit` corta a 10 intentos cada 15 minutos por IP en las rutas de autenticación, que son las más golpeadas en cualquier API pública con ataques de fuerza bruta automatizados.

## Stack

**Cliente**
- React 19 + Vite
- React Router para las rutas de la aplicación
- Tailwind CSS para estilos
- Framer Motion para animaciones (scroll, transiciones de entrada)
- React Leaflet + Leaflet para el mapa interactivo

**Servidor**
- Node.js + Express
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`) + `bcrypt` para autenticación
- `@google/genai` (Gemini) para generación de itinerarios y chat contextual
- `express-rate-limit` para proteger login/registro
- `cookie-parser`, `cors`, `dotenv`

## Cómo ejecutarlo en local

1. Clona el repositorio e instala dependencias en cada parte:

```bash
npm install            # dependencias del orquestador (concurrently)
cd client && npm install
cd ../server && npm install
```

2. Crea un archivo `.env` dentro de `server/` con estas variables:

```
PORT=3000
NODE_ENV=development
JWT_SECRET=una_clave_secreta_larga
GEMINI_API_KEY=tu_api_key_de_google_genai

# Opción A: URL de conexión completa
DATABASE_URL=postgresql://usuario:password@localhost:5432/wanderluxe

# Opción B: variables sueltas (si no usas DATABASE_URL)
DB_USER=usuario
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wanderluxe
```

3. Necesitas una base de datos PostgreSQL con al menos tres tablas: `users` (con `full_name`, `email`, `password_hash`, `role`, `avatar`), `trips` (con `user_id`, `destination`, `trip_data` en JSON, `status`, `budget`, `days`, `travelers`) y `messages` (con `user_id`, `sender`, `text`) para el historial del chat.

4. Desde la raíz del proyecto:

```bash
npm run dev
```

Esto levanta el servidor Express (puerto 3000) y el cliente Vite en paralelo. El cliente tiene configurado un proxy de `/api` hacia `http://localhost:3000`, así que no hace falta tocar CORS en desarrollo.

---

Proyecto personal de Rubén Simón ([@nexabuildev](https://github.com/nexabuildev)), construido para aprender a conectar un backend con autenticación real, una base de datos relacional y una API de IA generativa dentro de un producto con interfaz completa.
