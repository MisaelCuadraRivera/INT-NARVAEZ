# Sistema de Gestión Hospitalaria

Aplicación completa para gestión hospitalaria con backend Spring Boot y frontend React con PWA.

## Estructura del Proyecto

```
INT-NARVAEZ/
├── backend/          # Spring Boot API
└── frontend/         # React PWA
```

## Características

### Backend (Spring Boot)
- API REST con Spring Boot 3.2.0
- Autenticación JWT
- Roles: Admin, Enfermero, Paciente
- Gestión de Islas, Camas, Pacientes y Enfermeros
- Generación de códigos QR
- Base de datos H2 (desarrollo) / PostgreSQL (producción)

### Frontend (React + PWA)
- React 18 con Vite
- PWA configurado para móvil
- Diseño responsive (mobile-first)
- Tailwind CSS
- Autenticación JWT
- Dashboard con estadísticas
- Gestión completa de todas las entidades
- Visualización de códigos QR

## Instalación

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Funcionalidades por Rol

### Admin
- Crear y gestionar islas
- Crear y gestionar camas
- Crear y gestionar pacientes
- Crear y gestionar enfermeros
- Asignar enfermeros a islas
- Asignar pacientes a camas
- Ver dashboard completo

### Enfermero
- Ver islas asignadas
- Ver camas asignadas
- Ver pacientes
- Actualizar información de pacientes
- Ver códigos QR

### Paciente
- Ver su propia información
- Ver su cama asignada
- Ver su código QR

## Códigos QR

Cada cama tiene un código QR único que contiene:
- Información del paciente (nombre, diagnóstico, tratamiento)
- Información del enfermero encargado
- Información de la cama e isla

## Tecnologías

### Backend
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- JWT (jjwt)
- ZXing (QR Code)
- H2 / PostgreSQL
- Lombok

### Frontend
- React 18
- Vite
- React Router
- Axios
- Tailwind CSS
- qrcode.react
- Vite PWA Plugin
- React Toastify

## Base de Datos

Por defecto usa H2 en memoria. Para cambiar a PostgreSQL, edita `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hospitaldb
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

## Notas

- El backend usa H2 en memoria por defecto, los datos se pierden al reiniciar
- Para producción, configurar PostgreSQL
- El frontend está optimizado para móvil con navegación inferior
- Los códigos QR se generan automáticamente al crear camas
- La autenticación usa JWT con expiración de 24 horas

