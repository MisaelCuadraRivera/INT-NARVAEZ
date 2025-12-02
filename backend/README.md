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

