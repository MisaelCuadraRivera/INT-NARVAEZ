# Acceso desde móvil en la red local

El backend ahora escucha en `0.0.0.0:8080` (todos los interfaces de red) y el frontend auto-detecta la IP correcta.

## Pasos para acceder desde tu móvil:

### 1. Obtén tu IP local (macOS)
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Busca algo como `inet 192.168.1.178` (la IP que NO es `127.0.0.1`).

### 2. Levanta el backend
```bash
cd backend
mvn clean -DskipTests package
mvn spring-boot:run
```
El backend escuchará en `http://0.0.0.0:8080` (accesible desde cualquier IP de tu red local).

### 3. Levanta el frontend
```bash
cd frontend
npm run dev
```
Vite mostrará algo como:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.178:5173/
```

### 4. En tu móvil, abre el navegador
Accede a: `http://192.168.1.178:5173/` (reemplaza `192.168.1.178` con tu IP real)

### 5. Inicia sesión y usa la app
- Usuario: `admin` / Contraseña: `admin123`
- O: `enfermero` / `enfermero123`
- O: `paciente` / `paciente123`

### 6. Escanea un QR
- Ve a **Camas** → **Regenerar QR**
- Escanea el código QR con otro dispositivo (o desde otro navegador)
- Debería abrir la ficha pública sin errores

## Notas técnicas

- El backend ahora escucha en `server.address=0.0.0.0:8080` en `application.properties`.
- El CORS está configurado para aceptar cualquier origen (`setAllowedOriginPatterns("*")`).
- El frontend auto-detecta la IP/puerto desde `window.location` y llama al backend en el puerto `8080`.

## Si aún hay problemas

1. Verifica que tu móvil esté en la **misma red Wi-Fi** que tu PC.
2. Verifica que el firewall no bloquea el puerto `8080`:
   ```bash
   # En macOS, verificar si el puerto está en escucha:
   lsof -i :8080
   ```
3. Abre la consola del navegador del móvil (F12 en Safari → Develop) y verifica qué URL está intentando llamar.
