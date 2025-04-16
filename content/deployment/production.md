---
sidebar_position: 2
---

# Production Deployment

This guide provides recommendations for deploying NeuralLog in a production environment.

## Architecture Considerations

For production deployments, consider the following architecture:

- **Load Balancer**: Use a load balancer to distribute traffic across multiple instances of the logs server and web application.
- **Redis Cluster**: Use a Redis cluster for high availability and scalability.
- **Database Replication**: Set up replication for PostgreSQL to ensure data durability.
- **Containerization**: Use Docker containers for all components.
- **Orchestration**: Use Kubernetes or Docker Swarm for container orchestration.
- **Monitoring**: Implement monitoring and alerting for all components.
- **Backup**: Set up regular backups for all data stores.

## Security Considerations

### Authentication and Authorization

- Use strong passwords for all services.
- Enable JWT token expiration and rotation.
- Implement rate limiting for authentication endpoints.
- Use HTTPS for all communications.

### Network Security

- Use a private network for internal communication between services.
- Expose only necessary ports to the public internet.
- Implement a firewall to restrict access to services.
- Use network policies to control traffic between services.

### Data Security

- Encrypt sensitive data at rest and in transit.
- Implement regular security audits and vulnerability scanning.
- Follow the principle of least privilege for all service accounts.
- Implement proper access controls for all data stores.

## Scalability

### Horizontal Scaling

- Scale the logs server horizontally by adding more instances behind a load balancer.
- Use Redis Cluster for distributed storage.
- Scale the web application horizontally by adding more instances.

### Vertical Scaling

- Increase resources (CPU, memory) for services as needed.
- Monitor resource usage and scale proactively.

## High Availability

### Multi-Zone Deployment

- Deploy services across multiple availability zones.
- Use a global load balancer to distribute traffic across zones.

### Redundancy

- Run multiple instances of each service.
- Set up failover mechanisms for all components.
- Implement health checks and automatic recovery.

## Monitoring and Logging

### Metrics

- Collect metrics for all services using Prometheus or a similar tool.
- Monitor CPU, memory, disk, and network usage.
- Track application-specific metrics like request rate, error rate, and latency.

### Logging

- Centralize logs using a solution like ELK Stack or Graylog.
- Implement structured logging for all services.
- Set up log rotation and retention policies.

### Alerting

- Set up alerts for critical issues.
- Implement on-call rotation for incident response.
- Document incident response procedures.

## Backup and Recovery

### Regular Backups

- Set up regular backups for Redis and PostgreSQL.
- Test backup restoration procedures regularly.
- Store backups in a separate location or cloud storage.

### Disaster Recovery

- Document disaster recovery procedures.
- Implement automated recovery where possible.
- Test disaster recovery procedures regularly.

## CI/CD Pipeline

### Continuous Integration

- Set up automated testing for all components.
- Implement code quality checks and linting.
- Use a CI/CD platform like GitHub Actions, Jenkins, or GitLab CI.

### Continuous Deployment

- Automate deployment of all components.
- Implement blue-green or canary deployments for zero-downtime updates.
- Set up rollback procedures for failed deployments.

## Example Production Docker Compose

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  # Load balancer
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
    networks:
      - neurallog-network
    depends_on:
      - web
      - server
    restart: always

  # Redis for logs storage
  redis:
    image: redis:7.0-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - neurallog-network
    restart: always
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3
        window: 120s

  # PostgreSQL for OpenFGA
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - neurallog-network
    restart: always
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3
        window: 120s

  # OpenFGA server
  openfga:
    image: openfga/openfga:latest
    command: run
    environment:
      OPENFGA_DATASTORE_ENGINE: postgres
      OPENFGA_DATASTORE_URI: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      OPENFGA_LOG_FORMAT: json
      OPENFGA_AUTHN_METHOD: preshared
      OPENFGA_AUTHN_PRESHARED_KEYS: ${OPENFGA_KEY}
    networks:
      - neurallog-network
    depends_on:
      - postgres
    restart: always
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3
        window: 120s

  # Auth service
  auth:
    image: neurallog/auth:latest
    environment:
      NODE_ENV: production
      PORT: 3040
      OPENFGA_API_URL: http://openfga:8080
      OPENFGA_STORE_ID: ${OPENFGA_STORE_ID}
      OPENFGA_API_TOKEN: ${OPENFGA_KEY}
      JWT_SECRET: ${JWT_SECRET}
      DEFAULT_TENANT_ID: default
    networks:
      - neurallog-network
    depends_on:
      - openfga
    restart: always
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3
        window: 120s

  # Logs server
  server:
    image: neurallog/server:latest
    environment:
      NODE_ENV: production
      PORT: 3030
      STORAGE_TYPE: redis
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      DEFAULT_NAMESPACE: default
    networks:
      - neurallog-network
    depends_on:
      - redis
    restart: always
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3
        window: 120s

  # Web application
  web:
    image: neurallog/web:latest
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_AUTH_SERVICE_API_URL: https://auth.example.com
      NEXT_PUBLIC_AUTH_SERVICE_API_KEY: ${AUTH_API_KEY}
      LOGS_API_URL: http://server:3030
      NEXT_PUBLIC_LOGS_SERVICE_API_URL: https://logs.example.com
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      TENANT_ID: default
    networks:
      - neurallog-network
    depends_on:
      - server
      - auth
    restart: always
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3
        window: 120s

volumes:
  redis-data:
    driver: local
    driver_opts:
      type: none
      device: /data/redis
      o: bind
  postgres-data:
    driver: local
    driver_opts:
      type: none
      device: /data/postgres
      o: bind

networks:
  neurallog-network:
    driver: overlay
```

## Environment Variables

Create a `.env` file for production:

```
# Redis
REDIS_PASSWORD=strong-password-here

# PostgreSQL
POSTGRES_USER=openfga
POSTGRES_PASSWORD=strong-password-here
POSTGRES_DB=openfga

# OpenFGA
OPENFGA_KEY=your-openfga-key
OPENFGA_STORE_ID=your-openfga-store-id

# Auth
JWT_SECRET=your-jwt-secret
AUTH_API_KEY=your-auth-api-key
```

## Deployment Steps

1. Set up the infrastructure (servers, networks, etc.)
2. Build Docker images for all components
3. Push Docker images to a registry
4. Create the `.env` file with production values
5. Deploy using Docker Compose or Kubernetes
6. Set up monitoring and alerting
7. Test the deployment
8. Set up backup procedures

## Maintenance

### Updates

- Regularly update dependencies and base images
- Test updates in a staging environment before deploying to production
- Use semantic versioning for all components
- Document the update process

### Monitoring

- Regularly review metrics and logs
- Set up dashboards for key metrics
- Implement proactive monitoring and alerting

### Backup

- Regularly test backup restoration
- Monitor backup job success/failure
- Store backups securely and with appropriate retention policies
