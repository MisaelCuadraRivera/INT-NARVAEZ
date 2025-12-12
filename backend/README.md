# Hospital Management Backend

API REST con Spring Boot para gestión hospitalaria.

## Requisitos

- Java 17+
- Maven 3.6+

## Instalación

```bash
mvn clean install
```

## Ejecución

```bash
mvn spring-boot:run
```

## Endpoints

- `/api/auth/login` - Iniciar sesión
- `/api/auth/register` - Registrar usuario
- `/api/islands` - Gestión de islas
- `/api/beds` - Gestión de camas
- `/api/patients` - Gestión de pacientes
- `/api/nurses` - Gestión de enfermeros
- `/api/qr` - Códigos QR

## Base de Datos

Por defecto usa H2 en memoria. Para producción, configurar PostgreSQL en `application.properties`.



### MySQL (Docker)

Si tienes MySQL en Docker y quieres usarlo localmente con las credenciales `root`/`root`, crea la base de datos y ejecuta la aplicación con el perfil `mysql`:

1. (Si aún no existe) crea la base de datos `hospitaldb` dentro de MySQL:

```bash
# asumiendo que el contenedor expone el puerto 3306
docker exec -it <mysql-container-name> mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS hospitaldb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

2. Ejecuta la aplicación con el perfil `mysql`:

```bash
cd backend
mvn -Dspring-boot.run.profiles=mysql spring-boot:run
```

O alternativamente:

```bash
mvn -DskipTests package
java -jar -Dspring.profiles.active=mysql target/hospital-management-1.0.0.jar
```

La configuración de conexión usada por este proyecto está en `src/main/resources/application-mysql.properties`.



