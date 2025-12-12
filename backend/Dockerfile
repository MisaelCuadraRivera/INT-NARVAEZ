# Usar una imagen base de Maven para construir el proyecto
FROM maven:3.9.6-amazoncorretto-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Construir el .jar saltando los tests para ir más rápido
RUN mvn clean package -DskipTests

# Usar una imagen ligera de Java 21 para ejecutarlo
FROM amazoncorretto:21-alpine-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar"]

