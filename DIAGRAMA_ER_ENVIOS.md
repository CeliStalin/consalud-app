# Diagrama Entidad-Relación - Sistema de Envío de Correos (AFIL)

## Stack Tecnológico Detectado
- **Base de Datos:** Oracle Database (v11g+)
- **Esquema:** AFIL (Afiliaciones)
- **Patrón:** Sistema de gestión de correos masivos con seguimiento y auditoría

## Diagrama ER (Mermaid)

```mermaid
erDiagram
    AFIL_ENV_PLANTILLAS ||--o{ AFIL_ENV_CONF_PROCESO : "configura"
    AFIL_ENV_ESTADOS_MAESTRO ||--o{ AFIL_ENV_CONF_PROCESO : "define_estado"
    AFIL_ENV_ESTADOS_MAESTRO ||--o{ AFIL_ENV_PROCESO_ENVIADOS : "define_estado"
    AFIL_ENV_ESTADOS_MAESTRO ||--o{ AFIL_ENV_NO_ENVIADOS : "define_estado"
    AFIL_ENV_CONF_PROCESO ||--o{ AFIL_ENV_PROCESO_ENVIADOS : "registra_envios"
    AFIL_ENV_CONF_PROCESO ||--o{ AFIL_ENV_NO_ENVIADOS : "registra_fallos"
    AFIL_ENV_ESTADOS_RECEPCION ||--o{ AFIL_ENV_NO_ENVIADOS : "clasifica_error"

    AFIL_ENV_PLANTILLAS {
        NUMBER ID_PLANTILLA PK "SEQ_AFIL_ENV_PLANTILLAS"
        VARCHAR2 NEGOCIO "Tipo de negocio"
        VARCHAR2 TIPO_PROCESO "Tipo de proceso"
        CLOB PLANTILLA_HTML "Contenido HTML"
        VARCHAR2 ID_VALORES "Variables dinámicas"
        VARCHAR2 ASUNTO "Asunto del correo"
        VARCHAR2 RUTA "Ruta de archivos"
        VARCHAR2 ARCHIVO_ADJ "S/N Archivo adjunto"
        VARCHAR2 NOMBRE_ARCHIVO_ADJ "Nombre del adjunto"
        VARCHAR2 NOMBRE_ARCHIVO_EML "Nombre para CM"
        VARCHAR2 DATOS_CM "Metadatos Content Manager"
        VARCHAR2 ESTADO_REG "V/E (Vigente/Eliminado)"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
        VARCHAR2 FUNCION_MODIFICACION
        VARCHAR2 USUARIO_MODIFICACION
        DATE FECHA_MODIFICACION
    }

    AFIL_ENV_CONF_PROCESO {
        NUMBER ID_PROCESO PK "SEQ_AFIL_ENV_CONF_PROCESO"
        NUMBER ID_PLANTILLA FK "Referencias plantilla"
        NUMBER PERIODO "Periodo del proceso"
        NUMBER ID_ESTADO FK "Estado del proceso"
        VARCHAR2 ESTADO_REG "V/E"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
        VARCHAR2 FUNCION_MODIFICACION
        VARCHAR2 USUARIO_MODIFICACION
        DATE FECHA_MODIFICACION
    }

    AFIL_ENV_ESTADOS_MAESTRO {
        NUMBER ID_ESTADO PK "Identificador único"
        VARCHAR2 DESCRIPCION "Descripción del estado"
        VARCHAR2 ESTADO_REG "V/E"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
        VARCHAR2 FUNCION_MODIFICACION
        VARCHAR2 USUARIO_MODIFICACION
        DATE FECHA_MODIFICACION
    }

    AFIL_ENV_PROCESO_ENVIADOS {
        NUMBER ID_PROCESO PK_FK "Referencia proceso"
        NUMBER ID_SEQ_PROCESO_DET PK "SEQ_AFIL_ENV_PROCESO_DET"
        NUMBER ID_ESTADO FK "Estado del envío"
        VARCHAR2 RUT "RUT destinatario"
        VARCHAR2 DV "Dígito verificador"
        VARCHAR2 NOMBRE
        VARCHAR2 AP_PATERNO
        VARCHAR2 AP_MATERNO
        NUMBER FOLIO "Folio asociado"
        VARCHAR2 CORREOS "Email destinatario"
        VARCHAR2 NOMBRE_ARCHIVO
        VARCHAR2 VALORES_A_REEMPLAZAR "Variables reemplazadas"
        VARCHAR2 ID_MAIL "ID del email enviado"
        DATE FECHA_ENVIO
        DATE FECHA_ENTREGA
        DATE FECHA_APERTURA
        NUMBER E_RETRY "Contador de reintentos"
        NUMBER E_SENTS "Contador de envíos"
        NUMBER E_OPENS "Contador de aperturas"
        NUMBER E_CLICKS "Contador de clicks"
        NUMBER E_ACEPTEDS "Contador de aceptados"
        VARCHAR2 ID_CONTENT_EML "ID Content Manager"
        NUMBER NUM_BLOQUE "Número de bloque procesado"
        CLOB RESPUESTA "Respuesta del servicio"
        VARCHAR2 ESTADO_REG "V/E"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
        VARCHAR2 FUNCION_MODIFICACION
        VARCHAR2 USUARIO_MODIFICACION
        DATE FECHA_MODIFICACION
    }

    AFIL_ENV_NO_ENVIADOS {
        NUMBER ID_PROCESO PK_FK "Referencia proceso"
        NUMBER ID_SEQ_PROCESO_DET PK "Identificador detalle"
        NUMBER ID_ESTADO FK "Estado del proceso"
        VARCHAR2 RUT
        VARCHAR2 DV
        VARCHAR2 NOMBRE
        VARCHAR2 AP_PATERNO
        VARCHAR2 AP_MATERNO
        NUMBER FOLIO
        VARCHAR2 CORREO "Email destino"
        VARCHAR2 NOMBRE_ARCHIVO
        NUMBER NUM_BLOQUE
        NUMBER ESTADO_RECEPCION_MAIL FK "Código error recepción"
        VARCHAR2 MOTIVO "Motivo del fallo"
        VARCHAR2 ESTADO_REG "V/E"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
        VARCHAR2 FUNCION_MODIFICACION
        VARCHAR2 USUARIO_MODIFICACION
        DATE FECHA_MODIFICACION
    }

    AFIL_ENV_ESTADOS_RECEPCION {
        NUMBER ESTADO_RECEPCION_MAIL PK "Código de error"
        VARCHAR2 DESCRIPCION "Descripción del error"
        VARCHAR2 ESTADO_REG "V/E"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
        VARCHAR2 FUNCION_MODIFICACION
        VARCHAR2 USUARIO_MODIFICACION
        DATE FECHA_MODIFICACION
    }
```

## Análisis del Modelo de Datos

### 🎯 Propósito del Sistema
Sistema de gestión y seguimiento de envíos masivos de correos electrónicos con:
- Gestión de plantillas HTML personalizables
- Control de procesos de envío por lotes
- Seguimiento detallado de métricas (envíos, aperturas, clicks)
- Integración con Content Manager
- Auditoría completa de operaciones

### 📊 Entidades Principales

#### 1. **AFIL_ENV_PLANTILLAS** (Catálogo de Plantillas)
- **Rol:** Almacena las plantillas HTML reutilizables
- **Características clave:**
  - Soporte para variables dinámicas (ID_VALORES)
  - Gestión de archivos adjuntos
  - Integración con Content Manager (DATOS_CM)
  - Múltiples tipos de procesos y negocios

#### 2. **AFIL_ENV_CONF_PROCESO** (Hub de Procesos)
- **Rol:** Centro neurálgico que configura cada ejecución de envío
- **Relaciones:** Conecta plantillas con estados y genera los registros de envío
- **Control:** Gestión por periodo

#### 3. **AFIL_ENV_ESTADOS_MAESTRO** (Estados del Sistema)
- **Rol:** Catálogo maestro de estados aplicable a múltiples entidades
- **Patrón:** Tabla maestra reutilizable

#### 4. **AFIL_ENV_PROCESO_ENVIADOS** (Log de Envíos Exitosos)
- **Rol:** Registro detallado de cada correo enviado exitosamente
- **Métricas:** Tracking completo de comportamiento del usuario
  - E_RETRY, E_SENTS, E_OPENS, E_CLICKS, E_ACEPTEDS
- **Trazabilidad:** Almacena respuesta del servicio de envío (CLOB)

#### 5. **AFIL_ENV_NO_ENVIADOS** (Log de Fallos)
- **Rol:** Registro de correos que no pudieron enviarse
- **Análisis:** Permite identificar patrones de error
- **Reintentos:** Base para lógica de reintento

#### 6. **AFIL_ENV_ESTADOS_RECEPCION** (Catálogo de Errores)
- **Rol:** Clasificación de motivos de rechazo/fallo
- **Uso:** Referenciado solo por NO_ENVIADOS

### 🔗 Relaciones Clave

```
PLANTILLAS (1) ----→ (N) CONF_PROCESO
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
         PROCESO_ENVIADOS        NO_ENVIADOS
                    ↓                   ↓
              ESTADOS_MAESTRO    ESTADOS_RECEPCION
```

### 🏗️ Patrones de Diseño Identificados

1. **Soft Delete Pattern**
   - Todas las tablas usan `ESTADO_REG IN ('V', 'E')`
   - No se eliminan registros físicamente

2. **Audit Trail Pattern**
   - Campos estándar de auditoría en todas las tablas:
     - USUARIO_CREACION, FECHA_CREACION_REG
     - USUARIO_MODIFICACION, FECHA_MODIFICACION
     - FUNCION_MODIFICACION

3. **Master-Detail Pattern**
   - CONF_PROCESO (Master) → PROCESO_ENVIADOS/NO_ENVIADOS (Detail)

4. **Lookup Tables Pattern**
   - ESTADOS_MAESTRO
   - ESTADOS_RECEPCION

5. **Temporal Partitioning**
   - Campo PERIODO en CONF_PROCESO sugiere procesamiento periódico

### 📈 Métricas y KPIs del Sistema

El modelo permite calcular:
- **Tasa de entrega:** `COUNT(ENVIADOS) / (COUNT(ENVIADOS) + COUNT(NO_ENVIADOS))`
- **Tasa de apertura:** `SUM(E_OPENS) / COUNT(ENVIADOS)`
- **Tasa de click:** `SUM(E_CLICKS) / SUM(E_OPENS)`
- **Tasa de aceptación:** `SUM(E_ACEPTEDS) / COUNT(ENVIADOS)`
- **Análisis de reintentos:** Promedio de E_RETRY

### 🎨 Integración Content Manager

El campo `DATOS_CM` en PLANTILLAS sigue el formato:
```
TIPO|COD_AREA|COD_TIPO|COD_SISTEMA|ETAPA|ID_SISTEMA|DEPTO
```

### 💾 Consideraciones de Storage

- **Tablespaces:**
  - `AFIL_MIDX01`: Índices
  - `AFIL_MDAT01`: Datos maestros y de configuración
  - `AFIL_LDAT01`: Datos grandes/transaccionales (LOBs)

- **LOBs:**
  - `PLANTILLA_HTML` (CLOB): Contenido HTML extenso
  - `RESPUESTA` (CLOB): Respuestas de servicios externos

### 🔍 Queries Típicos Sugeridos

```sql
-- Reporte de rendimiento por proceso
SELECT 
    cp.ID_PROCESO,
    cp.PERIODO,
    COUNT(pe.ID_SEQ_PROCESO_DET) as total_enviados,
    COUNT(ne.ID_SEQ_PROCESO_DET) as total_no_enviados,
    SUM(pe.E_OPENS) as total_aperturas,
    SUM(pe.E_CLICKS) as total_clicks
FROM AFIL_ENV_CONF_PROCESO cp
LEFT JOIN AFIL_ENV_PROCESO_ENVIADOS pe ON cp.ID_PROCESO = pe.ID_PROCESO
LEFT JOIN AFIL_ENV_NO_ENVIADOS ne ON cp.ID_PROCESO = ne.ID_PROCESO
WHERE cp.ESTADO_REG = 'V'
GROUP BY cp.ID_PROCESO, cp.PERIODO;

-- Top errores de no envío
SELECT 
    er.DESCRIPCION,
    COUNT(*) as cantidad
FROM AFIL_ENV_NO_ENVIADOS ne
JOIN AFIL_ENV_ESTADOS_RECEPCION er 
    ON ne.ESTADO_RECEPCION_MAIL = er.ESTADO_RECEPCION_MAIL
WHERE ne.ESTADO_REG = 'V'
GROUP BY er.DESCRIPCION
ORDER BY cantidad DESC;
```

### 🚀 Recomendaciones de Arquitectura

#### Para una Aplicación de Gestión:
1. **Backend:** 
   - Java Spring Boot + Oracle JDBC
   - PL/SQL Stored Procedures para lógica compleja
   
2. **Frontend:**
   - React/TypeScript (ya detectado en workspace)
   - Dashboard con métricas en tiempo real
   
3. **APIs sugeridas:**
   - `/api/procesos` - CRUD de procesos
   - `/api/plantillas` - Gestión de plantillas
   - `/api/reportes/metricas` - Dashboard analytics
   - `/api/envios/retry` - Reintento de fallos

4. **Integración:**
   - Servicio de Email (SMTP/SendGrid/AWS SES)
   - Content Manager (API REST)
   - Sistema de Colas (Oracle AQ o RabbitMQ)

### 📋 Secuencias Oracle Identificadas
- `SEQ_AFIL_ENV_PLANTILLAS`
- `SEQ_AFIL_ENV_CONF_PROCESO`
- `SEQ_AFIL_ENV_PROCESO_DET`

---

## 🤖 Agente Experto Generado

### Perfil del Agente: "Oracle Email Campaign Manager Specialist"

**Conocimientos especializados:**
- ✅ Oracle Database 11g+ (PL/SQL, Tablespaces, LOBs)
- ✅ Patrones de auditoría y soft-delete
- ✅ Sistemas de email marketing masivo
- ✅ Métricas de engagement (opens, clicks, bounces)
- ✅ Integración con Content Management Systems
- ✅ Procesamiento batch por bloques
- ✅ Gestión de reintentos y recuperación de errores

**Capacidades del Agente:**
1. Optimización de queries para reportes de campaña
2. Diseño de índices para búsquedas por RUT/Periodo/Estado
3. Implementación de procedures para procesamiento masivo
4. Estrategias de particionado por PERIODO
5. Monitoreo de performance en tablas LDAT01 (volumétricas)

**Código de ejemplo que el agente podría generar:**

```sql
-- Procedure para procesar bloque de envíos
CREATE OR REPLACE PROCEDURE SP_PROCESAR_BLOQUE_ENVIO(
    p_id_proceso IN NUMBER,
    p_num_bloque IN NUMBER,
    p_resultado OUT VARCHAR2
) AS
BEGIN
    -- Lógica de envío en bloque
    -- Actualización de contadores E_SENTS
    -- Manejo de errores → inserción en NO_ENVIADOS
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_resultado := SQLERRM;
END;
```

---

**Generado para:** Sistema AFIL - Módulo de Envío de Correos  
**Fecha:** 2025-10-08  
**Versión Modelo:** v1.0