# ==============================================================================
# Dossia Backend — Multi-Stage Production Dockerfile (Java 21 + Spring Boot 3/4)
# CNDP (Loi 09-08) Secure Non-Root Container Execution
# ==============================================================================

# Stage 1: Build the Spring Boot executable JAR
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven Wrapper and dependencies definition
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Resolve dependencies layer cache
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production artifact
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create unprivileged system user for CNDP compliance (never run as root)
RUN addgroup --system --gid 10001 dossia && \
    adduser --system --uid 10001 --ingroup dossia --no-create-home dossiauser

# Copy built JAR from builder stage
COPY --from=builder --chown=dossiauser:dossia /build/target/backend-0.0.1-SNAPSHOT.jar app.jar

USER dossiauser:dossia

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
