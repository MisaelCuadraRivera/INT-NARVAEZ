# Solución de problemas - QR y acceso desde móvil

## Problema: "No se pudo establecer conexión con el servidor"

Este error ocurre cuando el móvil/dispositivo intenta conectarse a `http://192.168.x.x:8080/api` pero no puede alcanzar el backend.

### Causas posibles y soluciones:

#### 1. El backend no está corriendo
**Verificar:**
```bash
# En otra terminal, verifica si el puerto 8080 está en escucha
lsof -i :8080
```

**Solución:**
```bash
cd backend
mvn clean -DskipTests package
mvn spring-boot:run
```

Deberías ver algo como:
```
Started HospitalManagementApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http) with context path ''
```

#### 2. El backend no está escuchando en la red (solo en localhost)
Aunque configuramos `server.address=0.0.0.0`, a veces Spring Boot en macOS requiere un paso adicional.

**Solución alternativa - Usar environment variable:**
```bash
cd backend
SPRING_SERVER_ADDRESS=0.0.0.0 mvn spring-boot:run
```

O edita `application.properties` y asegúrate de que tenga exactamente:
```properties
server.port=8080
server.address=0.0.0.0
```

#### 3. El firewall está bloqueando el puerto 8080
**Verificar en macOS:**
```bash
# Ver si hay reglas de firewall
sudo pfctl -sr | grep 8080
```

**Solución:**
- Sistema → Configuración → Seguridad y privacidad → Firewall Options
- Asegúrate de permitir conexiones entrantes al puerto 8080

#### 4. El móvil y la PC no están en la misma red Wi-Fi
**Verificar:**
- Comprueba que ambos dispositivos usan la misma red Wi-Fi
- A veces el móvil conecta a una red distinta por defecto

#### 5. La IP que estás usando es incorrecta
**Obtener tu IP correcta:**
```bash
# En macOS
ifconfig | grep "inet " | grep -v 127.0.0.1
# Busca algo como: inet 192.168.x.x

# Otra opción
ipconfig getifaddr en0  # para Wi-Fi
ipconfig getifaddr en1  # para Ethernet
```

**Usar la IP correcta en el móvil:**
```
http://192.168.x.x:5173
```

### Script de diagnóstico rápido:

```bash
bash check-connectivity.sh
```

Este script verifica:
- Tu IP local
- Si el backend está corriendo
- Si el frontend está corriendo
- Si puedes conectarte al API

### Pasos recomendados para verificar:

1. **En tu PC, abre la terminal y ejecuta:**
```bash
bash check-connectivity.sh
```

2. **Si el backend no está corriendo, inicia sesiones de terminal separadas:**

Terminal 1 (Backend):
```bash
cd backend
mvn clean -DskipTests package
mvn spring-boot:run
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

3. **En tu PC, abre un navegador y accede:**
```
http://localhost:5173
```
Debería funcionar sin problemas.

4. **En tu móvil, abre un navegador y accede:**
```
http://192.168.x.x:5173
```
(reemplaza `192.168.x.x` con tu IP real)

Si ves mensajes de error con la URL en la pantalla pública (`/qr/...`), el error debería mostrar qué URL está intentando usar. **Cópiala y pégala aquí para que pueda ayudarte más.**

### Última opción: verificar desde Terminal

En tu PC:
```bash
# Verificar si puedes conectar al backend desde localhost
curl -v http://localhost:8080/api/qr/data/test

# Verificar si puedes conectar a tu IP
curl -v http://192.168.x.x:8080/api/qr/data/test
```

Si la primera funciona pero la segunda no, el problema es que el backend no está escuchando en todas las interfaces.
