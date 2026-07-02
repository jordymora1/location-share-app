# 📍 Ubicación en Vivo (tipo Life360)

App simple de compartir ubicación en tiempo real por "salas" (grupos). Cada quien entra con un código de sala y ve en el mapa a todos los que tengan el mismo código.

## Tecnologías
- **Backend:** Node.js + Express + Socket.io (tiempo real)
- **Frontend:** HTML/JS puro + Leaflet.js (mapas, sin API key ni costo) + OpenStreetMap

## Cómo correrlo en tu PC

```bash
npm install
npm start
```

Abre `http://localhost:3000` en el navegador. Repite en otra pestaña/dispositivo con el mismo código de sala para probar cómo se ven entre sí.

> Nota: el navegador pedirá permiso de ubicación. En `localhost` funciona sin HTTPS, pero si lo subes a producción, el navegador exige HTTPS para dar el GPS (los servicios de deploy de abajo ya te dan HTTPS gratis).

## Subir esto a tu GitHub

Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "App de ubicación en tiempo real"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git
git push -u origin main
```

(Antes crea el repo vacío en github.com → botón "New repository")

## Desplegarlo gratis (para que funcione fuera de tu PC)

Como tiene backend con Socket.io, necesitas un host que corra Node.js, no solo GitHub Pages (eso es solo para sitios estáticos). Opciones gratis que se conectan directo a tu repo de GitHub:

- **Render.com** → New → Web Service → conecta tu repo → Build: `npm install`, Start: `npm start`
- **Railway.app** → New Project → Deploy from GitHub repo → detecta Node.js automático
- **Fly.io** → requiere CLI pero tiene plan gratis

Cualquiera de esos te da un link público con HTTPS ya activado.

## Estructura

```
location-share-app/
├── server.js          # Backend: Express + Socket.io
├── package.json
├── public/
│   └── index.html      # Frontend: mapa + geolocalización
└── README.md
```

## Cómo funciona (resumen técnico)

1. El navegador pide tu ubicación con `navigator.geolocation.watchPosition()` (API nativa, GPS/WiFi/red)
2. Cada vez que cambia, se envía por WebSocket (Socket.io) al servidor
3. El servidor reenvía esa ubicación a todos los demás conectados en la misma "sala"
4. Cada cliente dibuja/actualiza el marcador de cada persona en el mapa Leaflet

## Posibles mejoras futuras
- Guardar historial de ubicaciones (con una base de datos tipo MongoDB o SQLite)
- Autenticación real de usuarios
- Alertas de "llegada a un lugar" (geofencing)
- Cifrado end-to-end de las coordenadas (como hace Locus)
