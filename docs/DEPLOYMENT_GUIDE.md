# Smart Krishi Sahayak: Deployment & Production Hardening Guide

## 1. Production Build Packaging

To prepare the application for deployment to a server environment (e.g. AWS EC2, DigitalOcean, local university server):

### 1.1 Packaging Command
```bash
mvn clean package -DskipTests -Pprod
```
This generates the executable FAT JAR file located at `target/smart-krishi-sahayak-1.0.0.jar`.

---

## 2. Production Deployment Options

### Option A: Standalone Systemd Service (Linux Server)
1. Copy the `.jar` file to `/opt/smartkrishi/app.jar`.
2. Create a system service definition at `/etc/systemd/system/smartkrishi.service`:

```ini
[Unit]
Description=Smart Krishi Sahayak Spring Boot Application
After=syslog.target network.target mysql.service

[Service]
User=krishi
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/smartkrishi/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
EnvironmentFile=/opt/smartkrishi/.env

[Install]
WantedBy=multi-user.target
```

3. Enable and start service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable smartkrishi
   sudo systemctl start smartkrishi
   ```

---

### Option B: Docker Containerization (`Dockerfile`)

```dockerfile
# Stage 1: Build JAR
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production Execution Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 3. Production Security Hardening Checklist

1. **Enforce HTTPS / SSL:** Use Nginx reverse proxy with Certbot / Let's Encrypt SSL certificates.
2. **Environment Secret Protection:** Ensure `.env` is readable only by the application service user (`chmod 600 .env`).
3. **Database Privileges:** Restrict the MySQL database user to `SELECT`, `INSERT`, `UPDATE`, `DELETE` operations on `krishi_db` only. Do not use the MySQL `root` account in production.
4. **CORS Restrictions:** Limit `allowedOrigins` in `CorsConfig` to exact domain names rather than wildcard `*`.
5. **Rate Limiting:** Protect `/api/v1/chat/send` with rate-limiting buckets (e.g. Bucket4j) to prevent abuse or API exhaustion.
