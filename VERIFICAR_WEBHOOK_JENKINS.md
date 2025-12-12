# Cómo Verificar que el Webhook está Configurado en Jenkins

## Paso 1: Verificar el Job de Jenkins

1. **Accede a Jenkins:**
   - Ve a `http://98.93.201.110:8080` (o tu URL de Jenkins)
   - Inicia sesión

2. **Ve a tu Job:**
   - Busca el job: **Deploy-Backend-Beanstalk**
   - Haz clic en el nombre del job

3. **Verificar la Configuración:**
   - Haz clic en **Configure** (en el menú lateral izquierdo)
   - Desplázate hasta la sección **Build Triggers**

4. **Verificar que el Trigger esté Habilitado:**
   - Debe estar marcado: ✅ **GitHub hook trigger for GITScm polling**
   - Si NO está marcado, márcalo y haz clic en **Save**

## Paso 2: Verificar la Configuración del Pipeline

En la misma página de **Configure**:

1. **Sección "Pipeline":**
   - **Definition**: Debe ser "Pipeline script from SCM"
   - **SCM**: Debe ser "Git"
   - **Repository URL**: Debe ser `https://github.com/MisaelCuadraRivera/INT-NARVAEZ.git`
   - **Branches to build**: Debe ser `*/main` (o la rama que uses)
   - **Script Path**: Debe ser `Jenkinsfile`

## Paso 3: Verificar el Plugin de GitHub

1. **Ve a Manage Jenkins:**
   - En el menú lateral izquierdo, haz clic en **Manage Jenkins**

2. **Ve a Manage Plugins:**
   - Haz clic en **Manage Plugins**

3. **Pestaña "Installed":**
   - Busca estos plugins (deben estar instalados):
     - ✅ **GitHub plugin**
     - ✅ **GitHub Branch Source Plugin**
     - ✅ **Git plugin**

4. Si NO están instalados:
   - Ve a la pestaña **Available**
   - Busca e instala los plugins faltantes
   - Reinicia Jenkins después de instalar

## Paso 4: Verificar los Logs del Sistema

1. **Ve a Manage Jenkins → System Log:**
   - Esto te mostrará si hay errores relacionados con webhooks

2. **Busca mensajes relacionados con:**
   - "GitHub webhook"
   - "Received POST"
   - Errores de conexión

## Paso 5: Probar el Webhook Manualmente

### Opción A: Desde GitHub (Recomendado)

1. **Ve a GitHub:**
   - Repositorio: `https://github.com/MisaelCuadraRivera/INT-NARVAEZ`
   - **Settings** → **Webhooks**
   - Haz clic en tu webhook

2. **Probar el Webhook:**
   - En la sección "Recent Deliveries", haz clic en la entrega más reciente
   - O haz clic en **"Redeliver"** para reenviar el último evento

3. **Verificar en Jenkins:**
   - Ve a tu job: **Deploy-Backend-Beanstalk**
   - Deberías ver un nuevo build ejecutándose automáticamente

### Opción B: Hacer un Commit de Prueba

1. **Haz un cambio pequeño:**
   ```bash
   echo "# Test webhook" >> README.md
   git add README.md
   git commit -m "Test webhook trigger"
   git push origin main
   ```

2. **Verificar en Jenkins:**
   - Ve a tu job inmediatamente después del push
   - Deberías ver un nuevo build iniciándose automáticamente
   - El build debería aparecer en la lista de "Build History"

## Paso 6: Verificar el Historial de Builds

1. **En tu Job de Jenkins:**
   - Ve a **Deploy-Backend-Beanstalk**
   - Mira la sección **"Build History"** (lado izquierdo)

2. **Indicadores de que el Webhook Funciona:**
   - Los builds se ejecutan automáticamente después de un push
   - No necesitas hacer clic en "Build Now" manualmente
   - Los builds aparecen poco después de hacer push a GitHub

## Paso 7: Verificar la Configuración del Webhook en GitHub

1. **Ve a GitHub:**
   - Repositorio → **Settings** → **Webhooks**

2. **Verifica tu Webhook:**
   - Debe estar ✅ **Active**
   - **Payload URL**: `http://98.93.201.110:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Debe incluir "Push"

3. **Revisa "Recent Deliveries":**
   - Debe mostrar entregas recientes
   - El estado debe ser **200 OK** (verde) si funciona
   - Si es rojo, haz clic para ver el error

## Checklist de Verificación

- [ ] El job tiene marcado: ✅ **GitHub hook trigger for GITScm polling**
- [ ] Los plugins de GitHub están instalados
- [ ] El repositorio está configurado correctamente en el Pipeline
- [ ] El webhook en GitHub está activo y muestra entregas
- [ ] Los builds se ejecutan automáticamente después de un push
- [ ] No hay errores en los logs del sistema de Jenkins

## Si el Webhook NO Funciona

1. **Verifica que el trigger esté habilitado:**
   - Job → Configure → Build Triggers → ✅ GitHub hook trigger

2. **Verifica la conectividad:**
   - GitHub debe poder alcanzar `http://98.93.201.110:8080/github-webhook/`
   - Revisa `WEBHOOK_TROUBLESHOOTING.md` para más detalles

3. **Revisa los logs:**
   - Manage Jenkins → System Log
   - Busca errores relacionados con GitHub

4. **Prueba manualmente:**
   - Haz clic en "Build Now" para verificar que el job funciona
   - Si funciona manualmente pero no con webhook, el problema es de conectividad
