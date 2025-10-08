# 📊 Documentación Completa - Modelo de Datos AFIL

## 🎯 Resumen

Este repositorio contiene un análisis exhaustivo del modelo de datos del sistema de envío masivo de correos del esquema **AFIL** (Afiliaciones) en Oracle Database, junto con la arquitectura completa para su implementación.

---

## 📁 Archivos Generados

### 1. [DIAGRAMA_ER_ENVIOS.md](./DIAGRAMA_ER_ENVIOS.md)
**Contenido:**
- ✅ Diagrama Entidad-Relación en formato Mermaid
- ✅ Análisis detallado de cada tabla
- ✅ Documentación de relaciones y foreign keys
- ✅ Patrones de diseño identificados
- ✅ Métricas y KPIs del sistema
- ✅ Queries SQL de ejemplo
- ✅ Perfil del "Agente Experto" generado

**Visualización:**
Para ver el diagrama Mermaid:
- GitHub/GitLab: Renderiza automáticamente
- VSCode: Extensión "Markdown Preview Mermaid Support"
- Online: https://mermaid.live/

---

### 2. [diagrama-er.plantuml](./diagrama-er.plantuml)
**Contenido:**
- ✅ Diagrama ER en formato PlantUML
- ✅ Código coloreado por tipo de tabla
- ✅ Notas explicativas de cada entidad
- ✅ Leyenda con convenciones

**Visualización:**
- VSCode: Extensión "PlantUML"
- IntelliJ IDEA: Plugin PlantUML integration
- Online: http://www.plantuml.com/plantuml/uml/
- CLI: `plantuml diagrama-er.plantuml` (genera PNG/SVG)

---

### 3. [QUERIES_UTILIES_AFIL_ENVIOS.sql](./QUERIES_UTILIES_AFIL_ENVIOS.sql)
**Contenido:**
- ✅ **Vista consolidada** `VW_METRICAS_PROCESO` para dashboard
- ✅ **Análisis de errores:** Top 10 fallos, destinatarios problemáticos
- ✅ **Análisis de engagement:** Ranking de plantillas, timing de aperturas
- ✅ **Monitoreo:** Procesos activos, progreso por bloques
- ✅ **Auditoría:** Historial de cambios, trazabilidad por RUT
- ✅ **Mantenimiento:** Detección de fragmentación, archivado
- ✅ **Reportes ejecutivos:** Resumen mensual, comparativo por negocio
- ✅ **Índices recomendados** para optimización

**Uso:**
```bash
sqlplus usuario/password@database @QUERIES_UTILIES_AFIL_ENVIOS.sql
```

---

### 4. [ARQUITECTURA_SISTEMA_ENVIOS.md](./ARQUITECTURA_SISTEMA_ENVIOS.md)
**Contenido:**
- ✅ **Stack tecnológico** detectado y recomendado
- ✅ **Arquitectura por capas** completa
- ✅ **5 módulos principales:**
  1. Gestión de Plantillas
  2. Configuración de Procesos
  3. Motor de Procesamiento
  4. Tracking y Webhooks
  5. Reportes y Analytics
- ✅ **Seguridad y autenticación** (JWT, RBAC)
- ✅ **Monitoreo y observabilidad** (Prometheus, ELK)
- ✅ **DevOps:** Docker, Kubernetes, CI/CD
- ✅ **Escalabilidad:** Particionamiento, caching, message queues
- ✅ **Testing:** Unit, Integration, E2E, Performance
- ✅ **Roadmap** de mejoras futuras
- ✅ **Prompt Maestro** para IA/Agentes

---

## 🗂️ Modelo de Datos - Vista Rápida

### Entidades Principales

| Tabla | Tipo | Propósito | Volumetría |
|-------|------|-----------|------------|
| `AFIL_ENV_PLANTILLAS` | Catálogo | Plantillas HTML reutilizables | Baja (< 1K) |
| `AFIL_ENV_CONF_PROCESO` | Configuración | Hub de procesos de envío | Media (< 10K) |
| `AFIL_ENV_PROCESO_ENVIADOS` | Transaccional | Log de envíos exitosos | **Alta (> 1M)** |
| `AFIL_ENV_NO_ENVIADOS` | Transaccional | Log de fallos | Alta (> 100K) |
| `AFIL_ENV_ESTADOS_MAESTRO` | Maestra | Catálogo de estados | Baja (< 100) |
| `AFIL_ENV_ESTADOS_RECEPCION` | Maestra | Códigos de error | Baja (< 50) |

### Flujo de Datos Simplificado

```
1. Crear PLANTILLA → Configurar PROCESO → Cargar destinatarios
                            ↓
2. Ejecutar proceso → Procesamiento por BLOQUES
                            ↓
3. Intento de envío → ✅ PROCESO_ENVIADOS
                    → ❌ NO_ENVIADOS (con reintento)
                            ↓
4. Webhook events → Actualizar métricas (E_OPENS, E_CLICKS)
```

---

## 🎨 Stack Tecnológico Detectado

### Frontend (Actual en Workspace)
```json
{
  "framework": "React 18+",
  "language": "TypeScript",
  "build": "Vite",
  "css": "Bulma + Custom overrides",
  "routing": "React Router",
  "state": "Context API / hooks"
}
```

### Backend (Recomendado)
- **Opción 1:** Java Spring Boot 3.x + Oracle JDBC
- **Opción 2:** NestJS + TypeScript + TypeORM
- **Opción 3:** Python FastAPI + SQLAlchemy

### Base de Datos (Actual)
- **Motor:** Oracle Database 11g+
- **Esquema:** AFIL
- **Tablespaces:** AFIL_MIDX01, AFIL_MDAT01, AFIL_LDAT01

### Infraestructura (Detectado)
- **Contenedores:** Docker + docker-compose
- **Orquestación:** Kubernetes (yamls detectados)
- **CI/CD:** Azure Pipelines
- **Web Server:** Nginx

---

## 🚀 Quick Start

### Visualizar Diagramas

**Opción 1: Mermaid (GitHub/GitLab)**
```bash
# Los archivos .md con bloques ```mermaid se renderizan automáticamente
# Abrir DIAGRAMA_ER_ENVIOS.md en GitHub
```

**Opción 2: PlantUML (Local)**
```bash
# Instalar PlantUML
brew install plantuml  # macOS
apt-get install plantuml  # Ubuntu

# Generar imagen
plantuml diagrama-er.plantuml
# Output: diagrama-er.png
```

**Opción 3: VSCode Extensions**
```bash
code --install-extension bierner.markdown-mermaid
code --install-extension jebbs.plantuml
```

### Ejecutar Queries de Análisis

```bash
# Conectar a Oracle
sqlplus afil_user/password@AFIL_DB

# Ejecutar script completo
@QUERIES_UTILIES_AFIL_ENVIOS.sql

# O ejecutar queries individuales
SELECT * FROM VW_METRICAS_PROCESO WHERE PERIODO = 202510;
```

### Implementar Sistema (Resumen)

1. **Base de Datos:**
   - Verificar que las 6 tablas estén creadas
   - Crear índices recomendados (ver archivo SQL)
   - Configurar particionamiento para tablas volumétricas

2. **Backend:**
   - Implementar APIs REST (ver ARQUITECTURA_SISTEMA_ENVIOS.md)
   - Configurar message queue (RabbitMQ/SQS)
   - Implementar workers de procesamiento

3. **Frontend:**
   - Crear módulos de gestión (plantillas, procesos)
   - Implementar dashboard de métricas
   - Configurar visualizaciones (Recharts/ApexCharts)

4. **Integración:**
   - Configurar proveedor de email (SendGrid/SES)
   - Implementar webhooks para tracking
   - Integrar con Content Manager

---

## 📈 Métricas del Sistema

### KPIs Principales

| Métrica | Fórmula | Target |
|---------|---------|--------|
| **Tasa de Entrega** | `ENVIADOS / (ENVIADOS + NO_ENVIADOS)` | ≥ 95% |
| **Tasa de Apertura** | `SUM(E_OPENS) / ENVIADOS` | ≥ 20% |
| **Tasa de Click** | `SUM(E_CLICKS) / SUM(E_OPENS)` | ≥ 10% |
| **Throughput** | Emails procesados/hora | ≥ 50,000 |
| **Latencia** | Tiempo proceso → envío | ≤ 5 min |

### Queries para KPIs

```sql
-- Ver archivo QUERIES_UTILIES_AFIL_ENVIOS.sql
-- Sección 1: DASHBOARD - MÉTRICAS GENERALES
SELECT * FROM VW_METRICAS_PROCESO
WHERE PERIODO >= TO_NUMBER(TO_CHAR(SYSDATE, 'YYYYMM'))
ORDER BY FECHA_PROCESO DESC;
```

---

## 🔍 Casos de Uso Comunes

### 1. Crear Nueva Campaña de Emails

**Pasos:**
1. Crear plantilla HTML en `AFIL_ENV_PLANTILLAS`
2. Definir variables dinámicas en `ID_VALORES`
3. Crear proceso en `AFIL_ENV_CONF_PROCESO`
4. Cargar destinatarios (CSV/Excel → Staging table)
5. Ejecutar proceso (cambia `ID_ESTADO`)
6. Monitorear progreso en tiempo real

**SQL:**
```sql
-- Paso 1: Insertar plantilla
INSERT INTO AFIL.AFIL_ENV_PLANTILLAS (
    ID_PLANTILLA, NEGOCIO, TIPO_PROCESO, PLANTILLA_HTML,
    ID_VALORES, ASUNTO, ARCHIVO_ADJ, USUARIO_CREACION
) VALUES (
    SEQ_AFIL_ENV_PLANTILLAS.NEXTVAL,
    'AFILIACION',
    'BIENVENIDA',
    '<html><body>Hola {{NOMBRE}}, bienvenido!</body></html>',
    'NOMBRE,RUT,FOLIO',
    'Bienvenido a AFIL',
    'N',
    'admin'
);

-- Paso 2: Crear proceso
INSERT INTO AFIL.AFIL_ENV_CONF_PROCESO (
    ID_PROCESO, ID_PLANTILLA, PERIODO, ID_ESTADO, USUARIO_CREACION
) VALUES (
    SEQ_AFIL_ENV_CONF_PROCESO.NEXTVAL,
    :plantilla_id,
    TO_NUMBER(TO_CHAR(SYSDATE, 'YYYYMM')),
    1, -- Estado: Configurado
    'admin'
);
```

### 2. Analizar Rendimiento de Plantilla

```sql
-- Ver queries en QUERIES_UTILIES_AFIL_ENVIOS.sql
-- Sección 3: ANÁLISIS DE ENGAGEMENT
-- Query: "Ranking de plantillas por efectividad"
```

### 3. Investigar Fallos de Envío

```sql
-- Ver queries en QUERIES_UTILIES_AFIL_ENVIOS.sql
-- Sección 2: ANÁLISIS DE ERRORES
-- Query: "Top 10 errores de no envío"
```

### 4. Reenviar Correos Fallidos

```sql
-- Identificar candidatos a reenvío
SELECT ne.* 
FROM AFIL.AFIL_ENV_NO_ENVIADOS ne
INNER JOIN AFIL.AFIL_ENV_ESTADOS_RECEPCION er
    ON ne.ESTADO_RECEPCION_MAIL = er.ESTADO_RECEPCION_MAIL
WHERE er.DESCRIPCION LIKE '%TEMPORAL%' -- Errores temporales
  AND ne.FECHA_CREACION_REG >= SYSDATE - 1
  AND ne.ESTADO_REG = 'V';

-- Nota: El reenvío debe manejarse via aplicación,
-- no directamente con SQL para mantener trazabilidad
```

---

## 🛠️ Troubleshooting

### Problema: Proceso lento (< 10K emails/hora)

**Diagnóstico:**
```sql
-- Verificar índices
SELECT index_name, status 
FROM dba_indexes 
WHERE table_name LIKE 'AFIL_ENV_%'
  AND status <> 'VALID';

-- Verificar estadísticas
SELECT table_name, last_analyzed 
FROM dba_tables 
WHERE table_name LIKE 'AFIL_ENV_%';
```

**Solución:**
```sql
-- Recompilar índices inválidos
ALTER INDEX idx_name REBUILD;

-- Actualizar estadísticas
BEGIN
    DBMS_STATS.GATHER_SCHEMA_STATS('AFIL');
END;
```

### Problema: Alto porcentaje de rebotes

**Diagnóstico:**
```sql
-- Analizar códigos de error más frecuentes
-- Ver query en archivo QUERIES_UTILIES_AFIL_ENVIOS.sql
-- Sección 2: Top 10 errores de no envío
```

**Posibles causas:**
- Direcciones de email inválidas
- Dominio bloqueado (blacklist)
- Límite de rate del proveedor
- Problema de autenticación (SPF/DKIM)

### Problema: Tablespace lleno

**Diagnóstico:**
```sql
SELECT 
    tablespace_name,
    ROUND(SUM(bytes)/1024/1024/1024, 2) as SIZE_GB,
    ROUND(MAX(bytes)/1024/1024, 2) as MAX_EXTENT_MB
FROM dba_free_space
GROUP BY tablespace_name
HAVING tablespace_name LIKE 'AFIL_%';
```

**Solución:**
- Ejecutar archivado de datos antiguos (> 2 años)
- Agregar datafile al tablespace
- Implementar particionamiento con DROP old partitions

---

## 📚 Referencias Adicionales

### Documentación Oracle
- [Oracle Database SQL Reference](https://docs.oracle.com/en/database/oracle/oracle-database/)
- [PL/SQL Packages and Types Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/)
- [Oracle Database Performance Tuning Guide](https://docs.oracle.com/en/database/oracle/oracle-database/19/tgdba/)

### Email Best Practices
- [SendGrid Email Deliverability Guide](https://sendgrid.com/resource/email-deliverability-guide/)
- [AWS SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
- [Email Marketing Benchmarks](https://www.campaignmonitor.com/resources/guides/email-marketing-benchmarks/)

### Herramientas
- **SQL Developer:** Cliente Oracle GUI
- **DBeaver:** Cliente universal de BD
- **Postman:** Testing de APIs
- **k6:** Load testing
- **Grafana:** Dashboards de métricas

---

## 🤝 Contribuciones

### Para Extender esta Documentación

1. **Agregar nuevas queries:**
   - Editar `QUERIES_UTILIES_AFIL_ENVIOS.sql`
   - Documentar propósito y parámetros
   - Incluir ejemplo de uso

2. **Actualizar diagramas:**
   - Modificar `diagrama-er.plantuml` o bloques Mermaid
   - Regenerar imágenes si aplica
   - Verificar renderizado en GitHub

3. **Proponer mejoras de arquitectura:**
   - Editar `ARQUITECTURA_SISTEMA_ENVIOS.md`
   - Justificar cambios con análisis
   - Incluir código de ejemplo

---

## 📞 Contacto

Para consultas sobre este modelo de datos o su implementación:

- **DBA Oracle:** Consultas sobre esquema, performance, particionamiento
- **Arquitecto de Software:** Decisiones de diseño, stack tecnológico
- **DevOps:** Infraestructura, CI/CD, Kubernetes
- **Product Owner:** Requerimientos funcionales, priorización

---

## 📄 Licencia

Documentación generada para uso interno del proyecto AFIL.

---

## ✨ Agradecimientos

Documentación generada mediante análisis detallado del modelo de datos Oracle del esquema AFIL, específicamente del módulo de envío de correos masivos (tablas `AFIL_ENV_*`).

**Fecha de generación:** 2025-10-08  
**Versión:** 1.0  
**Stack detectado:** React + TypeScript + Vite + Oracle + Kubernetes

---

## 🎯 Siguiente Pasos Recomendados

1. ✅ **Revisar diagramas:** Validar con equipo de arquitectura
2. ⏳ **Ejecutar queries de análisis:** Obtener métricas actuales del sistema
3. ⏳ **Implementar índices recomendados:** Mejorar performance
4. ⏳ **Diseñar APIs REST:** Según especificaciones en arquitectura
5. ⏳ **Configurar ambiente de desarrollo:** Docker Compose local
6. ⏳ **Crear prototipo de dashboard:** React + Recharts
7. ⏳ **Implementar worker de procesamiento:** Prueba de concepto
8. ⏳ **Setup CI/CD pipeline:** Azure DevOps

---

**¿Necesitas más detalle en algún aspecto? Consulta los archivos específicos listados arriba. 🚀**