# Configuración de Webhook GitHub → Jenkins

Esta guía te ayudará a configurar un webhook en GitHub para que automáticamente ejecute el pipeline de Jenkins cuando hagas un commit.

## Requisitos Previos

- Jenkins instalado y funcionando
- Plugin "GitHub plugin" instalado en Jenkins
- Acceso de administrador a Jenkins
- Repositorio en GitHub

## Paso 1: Instalar Plugin de GitHub en Jenkins

1. Ve a Jenkins → **Manage Jenkins** → **Manage Plugins**
2. Pestaña **Available**
3. Busca **"GitHub plugin"** y **"GitHub Branch Source Plugin"**
4. Selecciona ambos y haz clic en **Install without restart**
5. Espera a que se instalen y reinicia Jenkins si es necesario

## Paso 2: Configurar el Job de Jenkins

### Opción A: Usando Jenkinsfile (Recomendado)

El `Jenkinsfile` ya está configurado para activarse con webhooks. Solo necesitas:

1. Ve a tu job en Jenkins: **Deploy-Backend-Beanstalk**
2. Haz clic en **Configure**
3. En la sección **Pipeline**, verifica que:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/MisaelCuadraRivera/INT-NARVAEZ.git`
   - **Branches to build**: `*/main` (o la rama que uses)
   - **Script Path**: `Jenkinsfile`

4. En la sección **Build Triggers**, marca:
   - ✅ **GitHub hook trigger for GITScm polling**

5. Haz clic en **Save**

### Opción B: Configuración Manual del Trigger

Si prefieres configurarlo manualmente sin modificar el Jenkinsfile:

1. Ve a tu job: **Deploy-Backend-Beanstalk**
2. **Configure** → **Build Triggers**
3. Marca: ✅ **GitHub hook trigger for GITScm polling**
4. **Save**

## Paso 3: Configurar GitHub Webhook

1. Ve a tu repositorio en GitHub: `https://github.com/MisaelCuadraRivera/INT-NARVAEZ`

2. Ve a **Settings** → **Webhooks** → **Add webhook**

3. Configura el webhook:
   - **Payload URL**: `http://TU_IP_JENKINS:8080/github-webhook/`
     - Si Jenkins está en un servidor público, usa la IP pública
     - Si está en localhost, usa un servicio como ngrok para exponerlo
     - Ejemplo: `http://54.123.45.67:8080/github-webhook/`
   
   - **Content type**: `application/json`
   
   - **Which events would you like to trigger this webhook?**
     - Selecciona: ✅ **Just the push event**
     - O selecciona: ✅ **Let me select individual events** y marca:
       - ✅ Push
       - ✅ Pull request (opcional, si quieres que se ejecute en PRs)
   
   - **Active**: ✅ (debe estar marcado)
   
   - Haz clic en **Add webhook**

## Paso 4: Verificar que Jenkins Pueda Recibir Webhooks

### Si Jenkins está en un servidor público (EC2, etc.)

1. Asegúrate de que el puerto 8080 esté abierto en el Security Group
2. El webhook debería funcionar directamente

### Si Jenkins está en localhost o detrás de un firewall

Necesitas exponer Jenkins públicamente. Opciones:

#### Opción A: Usar ngrok (Rápido para pruebas)

```bash
# Instalar ngrok
# En macOS: brew install ngrok
# O descarga desde https://ngrok.com/

# Exponer Jenkins
ngrok http 8080

# Usa la URL que te da ngrok (ej: https://abc123.ngrok.io)
# En GitHub webhook, usa: https://abc123.ngrok.io/github-webhook/
```

#### Opción B: Configurar un reverse proxy (Nginx)

Configura Nginx para redirigir `/github-webhook/` a tu Jenkins local.

## Paso 5: Probar el Webhook

1. Haz un commit y push a tu repositorio:
   ```bash
   git add .
   git commit -m "Test webhook"
   git push origin main
   ```

2. Ve a GitHub → **Settings** → **Webhooks**
3. Haz clic en tu webhook
4. Ve a la sección **Recent Deliveries**
5. Deberías ver una entrega reciente con estado **200 OK**

6. Ve a Jenkins y verifica que el job se haya ejecutado automáticamente

## Solución de Problemas

### Error: "failed to connect to host"

Este error significa que GitHub no puede alcanzar tu servidor Jenkins. Sigue estos pasos:

#### 1. **Corregir la URL del Webhook**

La URL debe ser exactamente así (sin barras extra):
```
http://98.93.201.110:8080/github-webhook/
```

❌ **Incorrecto**: `http://98.93.201.110/:8080/github-webhook/` (tiene `/:8080`)
✅ **Correcto**: `http://98.93.201.110:8080/github-webhook/`

#### 2. **Verificar que el Puerto 8080 esté Abierto**

Si Jenkins está en EC2 o un servidor en la nube:

**Para AWS EC2:**
1. Ve a AWS Console → EC2 → Security Groups
2. Selecciona el Security Group de tu instancia Jenkins
3. **Inbound rules** → **Edit inbound rules**
4. Agrega una regla:
   - **Type**: Custom TCP
   - **Port**: 8080
   - **Source**: 0.0.0.0/0 (o solo las IPs de GitHub: 140.82.112.0/20)
   - **Description**: Jenkins Webhook
5. **Save rules**

**Para otros servidores:**
```bash
# Verificar si el puerto está abierto
sudo netstat -tulpn | grep 8080

# Si usas ufw (Ubuntu)
sudo ufw allow 8080/tcp
sudo ufw status

# Si usas firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

#### 3. **Verificar que Jenkins esté Escuchando en la IP Correcta**

Jenkins debe estar configurado para escuchar en `0.0.0.0` (todas las interfaces), no solo en `localhost`:

**Editar configuración de Jenkins:**
```bash
# En el servidor donde está Jenkins
sudo nano /etc/default/jenkins
# O si usas systemd:
sudo systemctl edit jenkins
```

Agrega o modifica:
```bash
JENKINS_LISTEN_ADDRESS=0.0.0.0
JENKINS_PORT=8080
```

Luego reinicia Jenkins:
```bash
sudo systemctl restart jenkins
# O
sudo service jenkins restart
```

#### 4. **Probar Conectividad desde tu Máquina**

```bash
# Desde tu máquina local, prueba si puedes conectarte
curl -I http://98.93.201.110:8080

# O desde el navegador, intenta acceder a:
# http://98.93.201.110:8080
```

Si no puedes conectarte, el problema es de red/firewall.

#### 5. **Verificar desde el Servidor**

```bash
# SSH al servidor Jenkins
ssh usuario@98.93.201.110

# Verificar que Jenkins esté corriendo
sudo systemctl status jenkins

# Verificar que esté escuchando en el puerto correcto
sudo netstat -tulpn | grep 8080
# Debe mostrar algo como: 0.0.0.0:8080

# Si solo muestra 127.0.0.1:8080, Jenkins solo escucha en localhost
```

#### 6. **Probar el Webhook Manualmente**

```bash
# Desde el servidor Jenkins, prueba el endpoint
curl -X POST http://localhost:8080/github-webhook/ \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

### El webhook no se activa

1. **Verifica la URL del webhook:**
   - Debe terminar en `/github-webhook/`
   - Debe ser accesible públicamente
   - **NO debe tener barras extra** (ej: `/:8080` es incorrecto)

2. **Verifica los logs de GitHub:**
   - GitHub → Settings → Webhooks → Tu webhook → Recent Deliveries
   - Revisa el error si hay alguno

3. **Verifica los logs de Jenkins:**
   - Jenkins → Manage Jenkins → System Log
   - Busca errores relacionados con GitHub

4. **Verifica que el plugin esté instalado:**
   - Jenkins → Manage Jenkins → Manage Plugins → Installed
   - Busca "GitHub plugin"

### El webhook se activa pero el job no corre

1. Verifica que el trigger esté habilitado:
   - Job → Configure → Build Triggers
   - ✅ GitHub hook trigger for GITScm polling

2. Verifica que el repositorio esté configurado correctamente:
   - Job → Configure → Pipeline
   - Verifica la URL del repositorio

### Error 403 Forbidden

- GitHub puede estar bloqueando la IP de Jenkins
- Verifica que no tengas restricciones de IP en GitHub
- O configura un token de acceso personal en lugar de webhook

## Configuración Avanzada: Filtrar por Rama

Si solo quieres que se ejecute en la rama `main`:

1. En el Jenkinsfile, ya está configurado para usar `${env.BRANCH_NAME}`
2. En GitHub webhook, puedes configurar para que solo se active en `main`:
   - En el webhook, en "Which events", selecciona "Let me select individual events"
   - Marca "Push" y luego en "Branch or tag filter" escribe: `main`

## Notas Importantes

- ⚠️ **No hagas commits en cada cambio pequeño**: El webhook ejecutará el pipeline completo cada vez que hagas push
- ✅ **Usa ramas de desarrollo**: Considera desplegar solo desde `main` o `production`
- ✅ **Revisa los logs**: Siempre revisa los logs de Jenkins después de un despliegue automático
