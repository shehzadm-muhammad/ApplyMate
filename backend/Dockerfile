# syntax=docker/dockerfile:1

FROM maven:3.9.16-eclipse-temurin-21-alpine AS build

WORKDIR /workspace

COPY pom.xml .

RUN mvn --batch-mode --no-transfer-progress dependency:go-offline

COPY src/main ./src/main

RUN mvn \
    --batch-mode \
    --no-transfer-progress \
    -DskipTests \
    clean package \
    && cp target/backend-*.jar target/app.jar

FROM eclipse-temurin:21-jre-alpine-3.23

RUN apk add --no-cache curl \
    && addgroup -S applymate \
    && adduser -S applymate -G applymate

WORKDIR /app

COPY --from=build --chown=applymate:applymate \
    /workspace/target/app.jar \
    /app/app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

EXPOSE 8080

USER applymate

HEALTHCHECK \
    --interval=30s \
    --timeout=5s \
    --start-period=40s \
    --retries=3 \
    CMD curl --fail --silent --show-error \
        "http://127.0.0.1:${PORT:-8080}/actuator/health" \
        > /dev/null || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]