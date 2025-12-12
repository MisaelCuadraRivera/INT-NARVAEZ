# Configuración de Elastic Beanstalk con Aurora

## Problema Actual

El despliegue falla porque la aplicación intenta conectarse a MySQL en `localhost:3306`, pero necesita conectarse a Aurora.

## Solución: Configurar Variables de Entorno para Aurora

Ya tienes Aurora configurado. Solo necesitas configurar las variables de entorno en Elastic Beanstalk para que la aplicación se conecte correctamente.

### Configurar Variables de Entorno en Elastic Beanstalk

1. **Obtener el endpoint de Aurora:**
   - Ve a la consola de AWS RDS
   - Selecciona tu cluster de Aurora
   - Copia el **Writer Endpoint** (no el Reader Endpoint)
   - Ejemplo: `tu-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com`

2. **Configurar Variables de Entorno en Elastic Beanstalk:**
   - Ve a tu entorno en Elastic Beanstalk: `Hospital-app-env`
   - Configuration → Software → Environment properties
   - Haz clic en "Edit"
   - Agrega las siguientes variables una por una:

### Variables de Entorno para tu Aurora

Copia y pega estas variables exactas en Elastic Beanstalk:

```
SPRING_PROFILES_ACTIVE=eb
SPRING_DATASOURCE_URL=jdbc:mysql://hospital-db.cq9scw8emw7y.us-east-1.rds.amazonaws.com:3306/hospital_db?useSSL=true&requireSSL=true&serverTimezone=America/Mexico_City&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root1234
JWT_SECRET=hospitalManagementSecretKey2024SecureAndLongEnoughForHS512
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=https://frontend-production-987f.up.railway.app
```

**Valores configurados:**
- ✅ Endpoint: `hospital-db.cq9scw8emw7y.us-east-1.rds.amazonaws.com`
- ✅ Usuario: `root`
- ✅ Contraseña: `root1234`
- ✅ Base de datos: `hospital_db`

**Nota importante:** 
- Usa el **Writer Endpoint** de Aurora (no el Reader Endpoint)
- Aurora requiere SSL, por eso `useSSL=true&requireSSL=true`
- El puerto por defecto de Aurora MySQL es `3306`

## Configuración de Seguridad para Aurora

### Configurar Security Group de Aurora

Asegúrate de que el Security Group de Aurora permita conexiones desde el Security Group de tu entorno de Elastic Beanstalk:

1. Ve a la consola de AWS RDS
2. Selecciona tu cluster de Aurora
3. Ve a la pestaña "Connectivity & security"
4. Haz clic en el Security Group asociado
5. Edita las reglas de entrada (Inbound rules)
6. Agrega una regla MySQL/Aurora (puerto 3306) desde el Security Group de Elastic Beanstalk

**Para encontrar el Security Group de Elastic Beanstalk:**
- Ve a tu entorno en Elastic Beanstalk
- Configuration → Instances → EC2 security groups
- Copia el ID del Security Group
- Úsalo en la regla de entrada de Aurora

### Verificar la Conexión

Después de configurar las variables de entorno y los Security Groups:

1. Guarda la configuración en Elastic Beanstalk
2. Espera a que se reinicie el entorno automáticamente
3. Revisa los logs en: Elastic Beanstalk → Logs → Request Logs
4. Busca errores de conexión a la base de datos

Si ves errores como "Communications link failure", verifica:
- ✅ El endpoint de Aurora es correcto (Writer Endpoint)
- ✅ El Security Group permite conexiones desde Elastic Beanstalk
- ✅ Las credenciales (usuario/contraseña) son correctas
- ✅ La base de datos `hospital_db` existe en Aurora

## Verificar la Configuración

Después de configurar las variables de entorno:

1. Reinicia el entorno de Elastic Beanstalk
2. Revisa los logs en: Elastic Beanstalk → Logs → Request Logs
3. Verifica que la aplicación se conecte correctamente a la base de datos

## Archivos Creados

- `Procfile`: Define cómo ejecutar la aplicación en Elastic Beanstalk
- `application-eb.properties`: Configuración específica para Elastic Beanstalk que usa variables de entorno
- `.ebignore`: Actualizado para incluir el Procfile
