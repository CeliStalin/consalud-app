# 🏗️ Arquitectura del Sistema de Envío de Correos Masivos - AFIL

## 📋 Resumen Ejecutivo

Este documento proporciona una arquitectura completa para implementar un sistema de gestión de envíos masivos de correos electrónicos basado en el modelo de datos Oracle existente del esquema AFIL.

---

## 🎯 Stack Tecnológico Detectado y Recomendado

### Base de Datos (Actual)
- **Motor:** Oracle Database 11g+
- **Esquema:** AFIL (Afiliaciones)
- **Tablespaces:**
  - `AFIL_MIDX01`: Índices
  - `AFIL_MDAT01`: Datos maestros y configuración
  - `AFIL_LDAT01`: Datos transaccionales y LOBs

### Backend Recomendado
```yaml
Opción 1 - Enterprise Java:
  Framework: Spring Boot 3.x
  Persistencia: Spring Data JPA + Hibernate
  Driver: Oracle JDBC 21c
  API: RESTful con OpenAPI 3.0
  Seguridad: Spring Security + OAuth2
  
Opción 2 - Microservicios Node.js:
  Framework: NestJS + TypeScript
  ORM: TypeORM o Prisma
  Driver: oracledb (node-oracledb)
  API: GraphQL + REST
  
Opción 3 - Python (Data-Intensive):
  Framework: FastAPI
  ORM: SQLAlchemy
  Driver: cx_Oracle
  Async: AsyncIO para procesamiento paralelo
```

### Frontend (Detectado en Workspace)
```yaml
Actual:
  - React 18+
  - TypeScript
  - Vite (Build tool)
  - Bulma CSS (detectado en overrides)
  
Recomendaciones adicionales:
  - React Query: Para estado del servidor
  - Recharts/ApexCharts: Visualización de métricas
  - React Table: Tablas de datos complejas
  - React Hook Form: Formularios de configuración
```

---

## 🏛️ Arquitectura Propuesta

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                      CAPA PRESENTACIÓN                       │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │  Dashboard │  │ Gestión de │  │  Reportes &         │   │
│  │  Principal │  │ Plantillas │  │  Analytics          │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
│         React + TypeScript + Vite + Bulma CSS               │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY / BFF                       │
│              (NGINX / Kong / AWS API Gateway)                │
│    • Rate Limiting  • Authentication  • Load Balancing       │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE SERVICIOS                         │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │  Servicio  │  │  Servicio  │  │    Servicio         │   │
│  │  Procesos  │  │  Plantillas│  │    Reportes         │   │
│  └─────┬──────┘  └─────┬──────┘  └──────────┬──────────┘   │
│        │               │                     │               │
│  ┌─────▼───────────────▼─────────────────────▼──────────┐   │
│  │         Servicio de Orquestación de Envíos           │   │
│  │    • Gestión de colas  • Procesamiento por bloques   │   │
│  │    • Reintentos        • Tracking de estados         │   │
│  └───────────────────────┬──────────────────────────────┘   │
└────────────────────────────┼────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE INTEGRACIÓN                        │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │   Email    │  │  Content   │  │   Message Queue     │   │
│  │  Provider  │  │  Manager   │  │  (RabbitMQ/Kafka)   │   │
│  │  (SMTP/SES)│  │    API     │  │                     │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PERSISTENCIA                      │
│              Oracle Database 11g+ (Esquema AFIL)             │
│  • Tablas Transaccionales  • Stored Procedures  • Sequences  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes del Sistema

### 1. Módulo de Gestión de Plantillas

**Responsabilidades:**
- CRUD de plantillas HTML
- Editor WYSIWYG con preview
- Gestión de variables dinámicas
- Versionamiento de plantillas

**Endpoints REST:**
```
POST   /api/v1/plantillas
GET    /api/v1/plantillas
GET    /api/v1/plantillas/{id}
PUT    /api/v1/plantillas/{id}
DELETE /api/v1/plantillas/{id}  (soft delete)
POST   /api/v1/plantillas/{id}/preview
GET    /api/v1/plantillas/{id}/variables
```

**Tecnologías sugeridas:**
- Editor: TinyMCE o CKEditor
- Validación HTML: DOMPurify
- Variables: Handlebars o Mustache

---

### 2. Módulo de Configuración de Procesos

**Responsabilidades:**
- Crear y configurar procesos de envío
- Asociar plantillas a procesos
- Definir audiencia (carga de CSV/Excel)
- Programación de envíos

**Endpoints REST:**
```
POST   /api/v1/procesos
GET    /api/v1/procesos
GET    /api/v1/procesos/{id}
PUT    /api/v1/procesos/{id}
POST   /api/v1/procesos/{id}/destinatarios  (carga masiva)
POST   /api/v1/procesos/{id}/iniciar
POST   /api/v1/procesos/{id}/pausar
POST   /api/v1/procesos/{id}/reanudar
GET    /api/v1/procesos/{id}/progreso
```

**Lógica de Negocio:**
```sql
-- Procedure PL/SQL sugerido
CREATE OR REPLACE PROCEDURE SP_CREAR_PROCESO(
    p_id_plantilla IN NUMBER,
    p_periodo IN NUMBER,
    p_usuario IN VARCHAR2,
    p_id_proceso OUT NUMBER
) AS
BEGIN
    SELECT SEQ_AFIL_ENV_CONF_PROCESO.NEXTVAL INTO p_id_proceso FROM DUAL;
    
    INSERT INTO AFIL.AFIL_ENV_CONF_PROCESO (
        ID_PROCESO, ID_PLANTILLA, PERIODO, ID_ESTADO,
        USUARIO_CREACION, FECHA_CREACION_REG
    ) VALUES (
        p_id_proceso, p_id_plantilla, p_periodo, 1, -- Estado: En Configuración
        p_usuario, SYSDATE
    );
    
    COMMIT;
END;
```

---

### 3. Motor de Procesamiento de Envíos

**Arquitectura:**
```
┌─────────────────────────────────────────┐
│      JOB SCHEDULER (Oracle Scheduler    │
│         o Quartz Scheduler)             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   ORQUESTADOR DE BLOQUES                │
│   • Lee destinatarios en bloques        │
│   • Tamaño bloque: 100-500 registros    │
│   • Control de concurrencia             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   PROCESADOR DE BLOQUE                  │
│   1. Leer destinatarios del bloque      │
│   2. Renderizar plantilla (variables)   │
│   3. Generar EML si corresponde         │
│   4. Enviar a cola de mensajes          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   MESSAGE QUEUE                         │
│   • RabbitMQ / AWS SQS / Oracle AQ      │
│   • Dead Letter Queue para fallos       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   WORKER DE ENVÍO (Pool de Workers)     │
│   1. Consume mensaje de la cola         │
│   2. Envía email via SMTP/API           │
│   3. Registra en PROCESO_ENVIADOS       │
│   4. Si falla → NO_ENVIADOS + Retry     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   WEBHOOK HANDLER                       │
│   • Recibe eventos del proveedor email  │
│   • Actualiza E_OPENS, E_CLICKS, etc.   │
│   • Timestamp de FECHA_APERTURA         │
└─────────────────────────────────────────┘
```

**Pseudocódigo del Worker:**
```python
async def process_email_worker():
    while True:
        mensaje = await queue.dequeue()
        
        try:
            # Preparar email
            email_data = {
                'to': mensaje['correo'],
                'subject': mensaje['asunto'],
                'html': mensaje['html_renderizado'],
                'attachments': mensaje['archivos_adjuntos']
            }
            
            # Enviar
            resultado = await email_provider.send(email_data)
            
            # Registrar éxito
            await db.insert_into_proceso_enviados(
                id_proceso=mensaje['id_proceso'],
                id_mail=resultado['message_id'],
                fecha_envio=datetime.now(),
                e_sents=1
            )
            
            # Subir EML a Content Manager si corresponde
            if mensaje['generar_eml']:
                cm_id = await content_manager.upload_eml(...)
                await db.update_id_content_eml(cm_id)
                
        except EmailProviderError as e:
            # Registrar fallo
            await db.insert_into_no_enviados(
                id_proceso=mensaje['id_proceso'],
                estado_recepcion_mail=obtener_codigo_error(e),
                motivo=str(e)
            )
            
            # Reintentar si es error temporal
            if e.is_retryable() and mensaje['reintentos'] < 3:
                await queue.enqueue_with_delay(mensaje, delay=300)
```

---

### 4. Módulo de Tracking y Webhooks

**Proveedores de Email compatibles:**
- SendGrid
- AWS SES
- Mailgun
- SparkPost
- SMTP tradicional (sin tracking avanzado)

**Webhook Endpoint:**
```
POST /api/v1/webhooks/email-events
```

**Eventos soportados:**
```json
{
  "event": "delivered|opened|clicked|bounced|unsubscribed",
  "email": "destinatario@example.com",
  "message_id": "abc123...",
  "timestamp": "2025-10-08T10:30:00Z",
  "user_agent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "url_clicked": "https://..."
}
```

**Handler de eventos:**
```typescript
// TypeScript/NestJS
@Post('webhooks/email-events')
async handleEmailEvent(@Body() event: EmailEvent) {
  const envio = await this.repository.findByIdMail(event.message_id);
  
  if (!envio) {
    throw new NotFoundException('Envío no encontrado');
  }
  
  switch (event.event) {
    case 'opened':
      await this.repository.incrementOpens(envio.id);
      await this.repository.updateFechaApertura(envio.id, event.timestamp);
      break;
      
    case 'clicked':
      await this.repository.incrementClicks(envio.id);
      break;
      
    case 'bounced':
      await this.noEnviadosService.registrarRebote(
        envio.idProceso,
        envio.idSeqProcesoDet,
        event.bounce_reason
      );
      break;
  }
}
```

---

### 5. Módulo de Reportes y Analytics

**Dashboards principales:**

#### Dashboard Ejecutivo
- Total de envíos del mes
- Tasa de entrega
- Tasa de apertura
- Tasa de click
- Gráfico de tendencia mensual
- Top 5 plantillas más efectivas

#### Dashboard de Procesos
- Lista de procesos activos
- Progreso en tiempo real
- Bloques procesados vs pendientes
- Errores recientes
- Tiempo estimado de finalización

#### Dashboard de Análisis
- Análisis de engagement por tipo de negocio
- Mejor hora de envío (análisis temporal)
- Análisis de dispositivos (si disponible)
- Geografía de aperturas (si disponible)
- Análisis de rebotes

**Endpoints REST:**
```
GET /api/v1/reportes/dashboard-ejecutivo
GET /api/v1/reportes/procesos/{id}/metricas
GET /api/v1/reportes/plantillas/{id}/rendimiento
GET /api/v1/reportes/analisis/engagement
GET /api/v1/reportes/analisis/temporal
GET /api/v1/reportes/errores/top-10
GET /api/v1/reportes/export/csv
GET /api/v1/reportes/export/excel
```

---

## 🔐 Seguridad y Autenticación

### Estrategia de Seguridad

```yaml
Autenticación:
  Método: JWT (JSON Web Tokens)
  Provider: OAuth2/OIDC (Keycloak, Auth0, Azure AD)
  Refresh Token: Sí, con rotación
  
Autorización:
  Modelo: RBAC (Role-Based Access Control)
  Roles:
    - ADMIN: Acceso completo
    - EDITOR: Crear/editar plantillas y procesos
    - VIEWER: Solo lectura de reportes
    - OPERATOR: Ejecutar procesos configurados
    
Protección de Datos:
  - Encriptación en tránsito: TLS 1.3
  - Encriptación en reposo: Oracle TDE
  - Logs de auditoría: Todas las operaciones
  - Enmascaramiento de datos sensibles en logs
  
Rate Limiting:
  - Por usuario: 100 requests/minuto
  - Por IP: 500 requests/minuto
  - Endpoints públicos (webhooks): 10,000/minuto
```

---

## 📊 Monitoreo y Observabilidad

### Stack de Observabilidad

```yaml
Métricas:
  Herramienta: Prometheus + Grafana
  Métricas clave:
    - Emails enviados/minuto
    - Tasa de fallos
    - Latencia de procesamiento
    - Tamaño de cola de mensajes
    - Uso de CPU/Memoria
    
Logs:
  Centralizados: ELK Stack (Elasticsearch, Logstash, Kibana)
  Formato: JSON estructurado
  Retención: 90 días
  
Trazabilidad:
  APM: New Relic / Datadog / Elastic APM
  Distributed Tracing: Jaeger / Zipkin
  
Alertas:
  - Tasa de fallos > 5%
  - Cola de mensajes > 10,000
  - Tiempo de procesamiento > 5 minutos/bloque
  - Disco de tablespace LDAT01 > 85%
```

---

## 🚀 Despliegue y DevOps

### Estrategia de Despliegue

```yaml
Contenedorización:
  Backend: Docker multi-stage builds
  Frontend: Nginx Alpine
  
Orquestación:
  Kubernetes (detectado en yaml/)
  Componentes:
    - Deployment con HPA (Horizontal Pod Autoscaler)
    - Service (ClusterIP + LoadBalancer)
    - Ingress (con TLS)
    - ConfigMaps y Secrets
    - CronJobs para procesamiento periódico
    
CI/CD:
  Azure Pipelines (detectado: azure-pipeline.yml)
  Stages:
    1. Build & Test
    2. SonarQube Analysis
    3. Docker Build & Push
    4. Deploy to DEV
    5. Deploy to TEST (manual approval)
    6. Deploy to PROD (manual approval)
    
Ambientes:
  - DEV: Auto-deploy en cada commit
  - TEST: Deploy manual, datos anonimizados
  - PROD: Deploy manual, ventana de mantenimiento
```

### Archivos Docker sugeridos

**Backend Dockerfile:**
```dockerfile
# Multi-stage para Java Spring Boot
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Frontend Dockerfile (detectado en workspace):**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
```

---

## 📈 Escalabilidad y Performance

### Estrategias de Optimización

#### 1. Base de Datos
```sql
-- Particionamiento por rango (PERIODO)
ALTER TABLE AFIL.AFIL_ENV_PROCESO_ENVIADOS
PARTITION BY RANGE (FECHA_ENVIO) (
    PARTITION p_2024_q1 VALUES LESS THAN (TO_DATE('2024-04-01', 'YYYY-MM-DD')),
    PARTITION p_2024_q2 VALUES LESS THAN (TO_DATE('2024-07-01', 'YYYY-MM-DD')),
    PARTITION p_2024_q3 VALUES LESS THAN (TO_DATE('2024-10-01', 'YYYY-MM-DD')),
    PARTITION p_2024_q4 VALUES LESS THAN (TO_DATE('2025-01-01', 'YYYY-MM-DD')),
    PARTITION p_future VALUES LESS THAN (MAXVALUE)
);

-- Índices funcionales
CREATE INDEX idx_proc_env_mes_anio 
ON AFIL.AFIL_ENV_PROCESO_ENVIADOS(
    EXTRACT(YEAR FROM FECHA_ENVIO),
    EXTRACT(MONTH FROM FECHA_ENVIO)
);

-- Materialized View para reportes
CREATE MATERIALIZED VIEW MV_METRICAS_DIARIAS
BUILD IMMEDIATE
REFRESH COMPLETE ON DEMAND
AS
SELECT 
    TRUNC(pe.FECHA_ENVIO) as FECHA,
    cp.ID_PLANTILLA,
    pt.NEGOCIO,
    COUNT(*) as TOTAL_ENVIOS,
    SUM(pe.E_OPENS) as TOTAL_APERTURAS,
    SUM(pe.E_CLICKS) as TOTAL_CLICKS
FROM AFIL.AFIL_ENV_PROCESO_ENVIADOS pe
INNER JOIN AFIL.AFIL_ENV_CONF_PROCESO cp ON pe.ID_PROCESO = cp.ID_PROCESO
INNER JOIN AFIL.AFIL_ENV_PLANTILLAS pt ON cp.ID_PLANTILLA = pt.ID_PLANTILLA
WHERE pe.ESTADO_REG = 'V'
GROUP BY TRUNC(pe.FECHA_ENVIO), cp.ID_PLANTILLA, pt.NEGOCIO;
```

#### 2. Caching
```yaml
Redis:
  Casos de uso:
    - Cache de plantillas HTML (TTL: 1 hora)
    - Cache de configuración de procesos activos
    - Cache de métricas agregadas (TTL: 5 minutos)
    - Rate limiting por usuario/IP
    - Session storage
```

#### 3. Procesamiento Asíncrono
```yaml
Message Queue:
  Opciones:
    1. RabbitMQ:
        Exchanges: direct, topic
        Queues: envio.email, envio.email.dlq, tracking.events
        Prefetch: 10 mensajes/worker
        
    2. AWS SQS + SNS:
        Standard Queue para envíos
        FIFO Queue para procesamiento ordenado
        Dead Letter Queue con alarmas
        
    3. Oracle Advanced Queuing:
        Nativo en Oracle DB
        PL/SQL integration
        Menor latencia en on-premise
```

#### 4. Horizontal Scaling
```yaml
Kubernetes HPA:
  Metrics:
    - CPU utilization > 70%
    - Memory utilization > 80%
    - Custom metric: queue_depth > 5000
  
  Replicas:
    Min: 2
    Max: 10
    Scale up: +2 pods cuando métrica > threshold por 2 min
    Scale down: -1 pod cuando métrica < threshold por 5 min
```

---

## 🧪 Testing

### Estrategia de Testing

```yaml
Unit Tests:
  Framework: JUnit 5 (Java) / Vitest (TypeScript)
  Coverage objetivo: 80%
  Mockeo: Mockito / Vitest Mock
  
Integration Tests:
  Framework: TestContainers (Oracle DB)
  Escenarios:
    - CRUD completo de entidades
    - Flujo completo de envío
    - Webhooks y actualización de métricas
    
E2E Tests:
  Framework: Playwright / Cypress
  Flujos críticos:
    - Crear plantilla y proceso
    - Ejecutar envío de prueba
    - Ver dashboard de métricas
    
Performance Tests:
  Framework: JMeter / k6
  Escenarios:
    - 10,000 emails/minuto
    - 100 usuarios simultáneos en dashboard
    - Carga de 50,000 destinatarios
    
Load Tests:
  Objetivo: 50,000 emails/hora
  Duración: 1 hora
  Aceptación: <5% de errores
```

---

## 📚 Documentación Técnica

### Artefactos de Documentación

1. **API Documentation**
   - OpenAPI 3.0 Specification
   - Swagger UI en `/api/docs`
   - Postman Collection

2. **Diagramas de Arquitectura**
   - Diagrama C4 (Context, Container, Component, Code)
   - Diagrama de Secuencia para flujos críticos
   - Diagrama ER (ya generado)

3. **Runbooks**
   - Procedimiento de despliegue
   - Troubleshooting guide
   - Disaster recovery plan
   - Escalado de capacidad

4. **Guías para Desarrolladores**
   - Setup de entorno local
   - Convenciones de código
   - Branching strategy (GitFlow)
   - Code review checklist

---

## 💡 Mejoras Futuras (Roadmap)

### Fase 2 - Inteligencia
- **Optimización de tiempo de envío:** ML para determinar mejor hora de envío por usuario
- **A/B Testing:** Comparación de variantes de plantillas
- **Personalización avanzada:** Contenido dinámico basado en perfil

### Fase 3 - Automatización
- **Campañas recurrentes:** Scheduler visual tipo cron
- **Triggers automáticos:** Envío basado en eventos (ej: cumpleaños)
- **Segmentación dinámica:** Audiencias basadas en queries

### Fase 4 - Análisis Avanzado
- **Predicción de churn:** Usuarios con bajo engagement
- **Recomendación de contenido:** Qué plantillas usar según audiencia
- **Attribution modeling:** Impacto de campañas en conversiones

---

## 🎓 Agente Experto - Prompt de Uso

### Prompt Maestro para IA

```markdown
Actúa como un **Arquitecto de Software Senior especializado en:**

1. **Stack Tecnológico:**
   - Oracle Database 11g+ (PL/SQL, Tablespaces, LOBs, Partitioning)
   - Java Spring Boot / NestJS (backend)
   - React + TypeScript (frontend)
   - Sistemas de mensajería (RabbitMQ, SQS)
   - Email providers (SendGrid, AWS SES)

2. **Dominio de Negocio:**
   - Sistemas de email marketing masivo
   - Procesamiento batch y por bloques
   - Métricas de engagement (opens, clicks, bounces)
   - Gestión de plantillas HTML con variables dinámicas
   - Integración con Content Management Systems

3. **Patrones de Diseño:**
   - Soft Delete Pattern
   - Audit Trail Pattern
   - Master-Detail Pattern
   - Event-Driven Architecture
   - CQRS para reportes

4. **Conocimientos de Base de Datos:**
   - Optimización de queries complejas
   - Diseño de índices para alta volumetría
   - Particionamiento de tablas transaccionales
   - Materialized Views para agregaciones
   - Oracle Advanced Queuing

**Modelo de Datos de Referencia:**
- AFIL_ENV_PLANTILLAS: Catálogo de templates HTML
- AFIL_ENV_CONF_PROCESO: Hub de configuración de envíos
- AFIL_ENV_PROCESO_ENVIADOS: Log transaccional de envíos exitosos (volumétrico)
- AFIL_ENV_NO_ENVIADOS: Log transaccional de fallos (volumétrico)
- AFIL_ENV_ESTADOS_MAESTRO: Tabla maestra de estados
- AFIL_ENV_ESTADOS_RECEPCION: Códigos de error de email

**Capacidades:**
- Generar código optimizado (Java/TypeScript/PL-SQL)
- Diseñar APIs RESTful
- Proponer arquitecturas escalables
- Optimizar queries y esquemas
- Implementar lógica de reintentos y circuit breakers
- Diseñar estrategias de testing
- Resolver problemas de performance

**Contexto actual:**
Sistema de envío masivo de correos para área de Afiliaciones,
con seguimiento de métricas, integración con Content Manager,
y procesamiento por bloques de hasta 50,000 emails/hora.
```

---

## 📞 Contacto y Soporte

Para implementación de este sistema, se recomienda:

1. **DevOps Engineer:** Setup de infraestructura K8s y CI/CD
2. **Backend Developer:** Implementación de servicios y APIs
3. **Frontend Developer:** Dashboard y módulos de gestión
4. **DBA Oracle:** Optimización de BD y stored procedures
5. **QA Engineer:** Suite de tests automatizados

---

**Documento generado:** 2025-10-08  
**Versión:** 1.0  
**Autor:** Análisis de modelo de datos AFIL