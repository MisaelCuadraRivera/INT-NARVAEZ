# Solución Rápida: Error "failed to connect to host"

## Problema
GitHub no puede conectarse a tu Jenkins en `http://98.93.201.110:8080/github-webhook/`

## Solución Paso a Paso

### 1. Corregir la URL en GitHub

La URL correcta es (sin la barra extra):
```
http://98.93.201.110:8080/github-webhook/
```

**NO uses**: `http://98.93.201.110/:8080/github-webhook/` ❌

### 2. Verificar Security Group (Si está en AWS EC2)

```bash
# Ve a AWS Console → EC2 → Security Groups
# Selecciona el Security Group de tu instancia
# Inbound Rules → Edit inbound rules
# Agrega:
#   - Type: Custom TCP
#   - Port: 8080
#   - Source: 0.0.0.0/0 (o 140.82.112.0/20 para solo GitHub)
#   - Save
```

### 3. Verificar Firewall del Servidor

```bash
# Conectarte al servidor
ssh usuario@98.93.201.110

# Verificar firewall (Ubuntu/Debian)
sudo ufw status
sudo ufw allow 8080/tcp

# O si usas iptables
sudo iptables -L -n | grep 8080
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables-save
```

### 4. Verificar que Jenkins Escuche en Todas las Interfaces

```bash
# En el servidor Jenkins
sudo systemctl status jenkins

# Verificar en qué IP está escuchando
sudo netstat -tulpn | grep 8080

# Debe mostrar: 0.0.0.0:8080 (no 127.0.0.1:8080)
```

Si solo muestra `127.0.0.1:8080`, edita la configuración:

```bash
# Editar configuración de Jenkins
sudo nano /etc/default/jenkins

# Agrega o modifica:
JENKINS_LISTEN_ADDRESS=0.0.0.0
JENKINS_PORT=8080

# Reiniciar Jenkins
sudo systemctl restart jenkins
```

### 5. Probar Conectividad

Desde tu máquina local:
```bash
# Debe responder con código HTTP
curl -I http://98.93.201.110:8080

# O desde el navegador:
# http://98.93.201.110:8080
```

### 6. Verificar desde GitHub

1. Ve a GitHub → Settings → Webhooks
2. Haz clic en tu webhook
3. Haz clic en "Recent Deliveries"
4. Haz clic en la entrega más reciente
5. Revisa el error detallado

### 7. Comandos de Verificación Rápida

```bash
# En el servidor Jenkins, ejecuta todos estos comandos:

# 1. Verificar que Jenkins está corriendo
sudo systemctl status jenkins

# 2. Verificar puerto
sudo netstat -tulpn | grep 8080

# 3. Verificar firewall
sudo ufw status
# O
sudo firewall-cmd --list-all

# 4. Probar endpoint localmente
curl -X POST http://localhost:8080/github-webhook/ \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'

# 5. Ver logs de Jenkins
sudo tail -f /var/log/jenkins/jenkins.log
```

## Checklist Final

- [ ] URL del webhook es correcta: `http://98.93.201.110:8080/github-webhook/`
- [ ] Security Group permite tráfico en puerto 8080
- [ ] Firewall del servidor permite puerto 8080
- [ ] Jenkins escucha en `0.0.0.0:8080` (no solo `127.0.0.1:8080`)
- [ ] Puedes acceder a `http://98.93.201.110:8080` desde tu navegador
- [ ] El webhook en GitHub está activo (✅)

## Si Nada Funciona: Usar ngrok (Temporal)

Si no puedes abrir el puerto 8080, usa ngrok como solución temporal:

```bash
# En el servidor Jenkins
ngrok http 8080

# Usa la URL que te da (ej: https://abc123.ngrok.io)
# En GitHub webhook, usa: https://abc123.ngrok.io/github-webhook/
```
