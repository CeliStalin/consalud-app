# Diagrama Entidad-Relación - Sistema de Envío de Correos (AFIL)

## Análisis del Modelo de Datos

### Stack Tecnológico Detectado:
- **Base de Datos**: Oracle Database
- **Esquema**: AFIL (Afiliación)
- **Dominio**: Sistema de Gestión de Envío de Correos Electrónicos con Plantillas
- **Patrón de Auditoría**: Campos estándar (ESTADO_REG, FECHA_ESTADO_REG, USUARIO_CREACION, etc.)

---

## Diagrama ER (Formato Mermaid)

```mermaid
erDiagram
    AFIL_ENV_PLANTILLAS ||--o{ AFIL_ENV_CONF_PROCESO : "define_proceso"
    AFIL_ENV_ESTADOS_MAESTRO ||--o{ AFIL_ENV_CONF_PROCESO : "indica_estado"
    AFIL_ENV_ESTADOS_MAESTRO ||--o{ AFIL_ENV_PROCESO_ENVIADOS : "indica_estado"
    AFIL_ENV_ESTADOS_MAESTRO ||--o{ AFIL_ENV_NO_ENVIADOS : "indica_estado"
    AFIL_ENV_CONF_PROCESO ||--o{ AFIL_ENV_PROCESO_ENVIADOS : "registra_envios"
    AFIL_ENV_CONF_PROCESO ||--o{ AFIL_ENV_NO_ENVIADOS : "registra_rechazos"
    AFIL_ENV_ESTADOS_RECEPCION ||--o{ AFIL_ENV_NO_ENVIADOS : "clasifica_rechazo"

    AFIL_ENV_PLANTILLAS {
        NUMBER ID_PLANTILLA PK "Identificador único SEQ_AFIL_ENV_PLANTILLAS"
        VARCHAR2 NEGOCIO "Tipo de negocio"
        VARCHAR2 TIPO_PROCESO "Tipo de proceso"
        CLOB PLANTILLA_HTML "Contenido HTML"
        VARCHAR2 ID_VALORES "Identificadores de valores"
        VARCHAR2 ASUNTO "Asunto del correo"
        VARCHAR2 RUTA "Ruta archivo"
        VARCHAR2 ARCHIVO_ADJ "S/N Tiene adjunto"
        VARCHAR2 NOMBRE_ARCHIVO_ADJ "Nombre del adjunto"
        VARCHAR2 NOMBRE_ARCHIVO_EML "Nombre archivo EML"
        VARCHAR2 DATOS_CM "Datos Content Manager"
        VARCHAR2 ESTADO_REG "V=Vigente E=Eliminado"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
    }

    AFIL_ENV_CONF_PROCESO {
        NUMBER ID_PROCESO PK "Identificador único del proceso"
        NUMBER ID_PLANTILLA FK "Referencia plantilla"
        NUMBER PERIODO "Periodo del proceso"
        NUMBER ID_ESTADO FK "Estado del proceso"
        VARCHAR2 ESTADO_REG "V=Vigente E=Eliminado"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
    }

    AFIL_ENV_ESTADOS_MAESTRO {
        NUMBER ID_ESTADO PK "Identificador único del estado"
        VARCHAR2 DESCRIPCION "Descripción del estado"
        VARCHAR2 ESTADO_REG "V=Vigente E=Eliminado"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
    }

    AFIL_ENV_ESTADOS_RECEPCION {
        NUMBER ESTADO_RECEPCION_MAIL PK "Identificador estado recepción"
        VARCHAR2 DESCRIPCION "Descripción del estado"
        VARCHAR2 ESTADO_REG "V=Vigente E=Eliminado"
        DATE FECHA_ESTADO_REG
        VARCHAR2 USUARIO_CREACION
        DATE FECHA_CREACION_REG
    }

    AFIL_ENV_PROCESO_ENVIADOS {
        NUMBER ID_PROCESO PK_FK "SEQ_AFIL_ENV_CONF_PROCESO"
        NUMBER ID_SEQ_PROCESO_DET PK "SEQ_AFIL_ENV_PROCESO_DET"
        NUMBER ID_ESTADO FK "Estado del envío"
        VARCHAR2 RUT "RUT destinatario"
        VARCHAR2 DV "Dígito verificador"
        VARCHAR2 NOMBRE
        VARCHAR2 AP_PATERNO
        VARCHAR2 AP_MATERNO
        NUMBER FOLIO
        VARCHAR2 CORREOS "Email destinatario"
        VARCHAR2 NOMBRE_ARCHIVO
        VARCHAR2 VALORES_A_REEMPLAZAR "Variables plantilla"
        VARCHAR2 ID_MAIL "ID del correo enviado"
        DATE FECHA_ENVIO
        DATE FECHA_ENTREGA
        DATE FECHA_APERTURA
        NUMBER E_RETRY "Número reintentos"
        NUMBER E_SENTS "Número envíos"
        NUMBER E_OPENS "Número aperturas"
        NUMBER E_CLICKS "Número clicks"
        NUMBER E_ACEPTEDS "Número aceptados"
        VARCHAR2 ID_CONTENT_EML "ID Content Manager"
        NUMBER NUM_BLOQUE "Número de bloque"
        CLOB RESPUESTA "Respuesta del servicio"
        VARCHAR2 ESTADO_REG "V=Vigente E=Eliminado"
    }

    AFIL_ENV_NO_ENVIADOS {
        NUMBER ID_PROCESO PK_FK "Identificador del proceso"
        NUMBER ID_SEQ_PROCESO_DET PK "Identificador correlativo"
        NUMBER ID_ESTADO FK "Estado del registro"
        VARCHAR2 RUT "RUT destinatario"
        VARCHAR2 DV "Dígito verificador"
        VARCHAR2 NOMBRE
        VARCHAR2 AP_PATERNO
        VARCHAR2 AP_MATERNO
        NUMBER FOLIO
        VARCHAR2 CORREO "Email destinatario"
        VARCHAR2 NOMBRE_ARCHIVO
        NUMBER NUM_BLOQUE "Número de bloque"
        NUMBER ESTADO_RECEPCION_MAIL FK "Código rechazo"
        VARCHAR2 MOTIVO "Motivo del rechazo"
        VARCHAR2 ESTADO_REG "V=Vigente E=Eliminado"
    }
```

---

## Descripción de Relaciones

### 1. **AFIL_ENV_PLANTILLAS** (Tabla Maestra de Plantillas)
- **Propósito**: Almacena plantillas HTML para correos electrónicos
- **Relaciones**: 
  - Una plantilla puede ser usada en múltiples procesos de configuración

### 2. **AFIL_ENV_ESTADOS_MAESTRO** (Catálogo de Estados)
- **Propósito**: Tabla maestra de estados del sistema
- **Relaciones**: 
  - Un estado puede estar asociado a múltiples procesos, envíos y rechazos

### 3. **AFIL_ENV_ESTADOS_RECEPCION** (Catálogo de Estados de Recepción)
- **Propósito**: Códigos de recepción/rechazo de correos
- **Relaciones**: 
  - Un estado de recepción puede estar asociado a múltiples correos no enviados

### 4. **AFIL_ENV_CONF_PROCESO** (Configuración de Procesos)
- **Propósito**: Configuración de procesos de envío
- **Relaciones**: 
  - Depende de una plantilla (FK: ID_PLANTILLA)
  - Tiene un estado asociado (FK: ID_ESTADO)
  - Es referenciado por envíos exitosos y fallidos

### 5. **AFIL_ENV_PROCESO_ENVIADOS** (Log de Envíos Exitosos)
- **Propósito**: Registro de correos enviados exitosamente
- **Relaciones**: 
  - Pertenece a un proceso de configuración (FK: ID_PROCESO)
  - Tiene un estado asociado (FK: ID_ESTADO)
- **Métricas**: Tracking completo (envíos, aperturas, clicks, reintentos)

### 6. **AFIL_ENV_NO_ENVIADOS** (Log de Envíos Fallidos)
- **Propósito**: Registro de correos que no pudieron ser enviados
- **Relaciones**: 
  - Pertenece a un proceso de configuración (FK: ID_PROCESO)
  - Tiene un estado asociado (FK: ID_ESTADO)
  - Tiene un estado de recepción que indica la razón del fallo (FK: ESTADO_RECEPCION_MAIL)

---

## Cardinalidad de Relaciones

| Relación | Cardinalidad | Descripción |
|----------|--------------|-------------|
| PLANTILLAS → CONF_PROCESO | 1:N | Una plantilla define múltiples procesos |
| ESTADOS_MAESTRO → CONF_PROCESO | 1:N | Un estado puede estar en múltiples procesos |
| ESTADOS_MAESTRO → PROCESO_ENVIADOS | 1:N | Un estado clasifica múltiples envíos |
| ESTADOS_MAESTRO → NO_ENVIADOS | 1:N | Un estado clasifica múltiples rechazos |
| CONF_PROCESO → PROCESO_ENVIADOS | 1:N | Un proceso tiene múltiples envíos |
| CONF_PROCESO → NO_ENVIADOS | 1:N | Un proceso tiene múltiples rechazos |
| ESTADOS_RECEPCION → NO_ENVIADOS | 1:N | Un código de recepción clasifica múltiples rechazos |

---

## Patrón de Auditoría Detectado

Todas las tablas implementan un patrón de auditoría estándar:

```sql
ESTADO_REG VARCHAR2(1) DEFAULT 'V'  -- V: Vigente, E: Eliminado (Soft Delete)
FECHA_ESTADO_REG DATE DEFAULT SYSDATE
USUARIO_CREACION VARCHAR2(50)
FECHA_CREACION_REG DATE DEFAULT SYSDATE
FUNCION_MODIFICACION VARCHAR2(100)
USUARIO_MODIFICACION VARCHAR2(50)
FECHA_MODIFICACION DATE
```

Este patrón indica:
- ✅ **Soft Delete**: Los registros no se eliminan físicamente
- ✅ **Auditoría completa**: Rastreo de creación y modificación
- ✅ **Trazabilidad**: Usuario y función que realizó cambios

---

## Flujo de Negocio Inferido

```
1. Crear/Configurar PLANTILLA HTML
        ↓
2. Configurar PROCESO con plantilla y periodo
        ↓
3. Ejecutar envío de correos
        ↓
    ┌───────┴───────┐
    ↓               ↓
4a. ÉXITO       4b. FALLO
    ↓               ↓
 PROCESO_ENVIADOS  NO_ENVIADOS
 (con métricas)    (con motivo)
```

---

## Consideraciones Técnicas

### Secuencias Oracle Detectadas:
- `SEQ_AFIL_ENV_PLANTILLAS` → ID_PLANTILLA
- `SEQ_AFIL_ENV_CONF_PROCESO` → ID_PROCESO
- `SEQ_AFIL_ENV_PROCESO_DET` → ID_SEQ_PROCESO_DET

### Tablespaces:
- **AFIL_MIDX01**: Índices
- **AFIL_MDAT01**: Datos maestros
- **AFIL_LDAT01**: Datos transaccionales (logs)

### Tipos de Datos Especiales:
- **CLOB**: Plantillas HTML y respuestas de servicios
- **NUMBER**: Identificadores y contadores
- **DATE**: Campos de auditoría temporal

---

## Recomendaciones de Arquitectura

### Para un Agente Experto en este Stack:

1. **Lenguaje Backend**: PL/SQL, Java, .NET o Node.js
2. **ORM Sugerido**: 
   - Java: Hibernate/JPA
   - .NET: Entity Framework
   - Node.js: TypeORM con soporte Oracle
3. **Patrón de Diseño**: Repository Pattern + Unit of Work
4. **API**: RESTful con endpoints para:
   - Gestión de plantillas
   - Configuración de procesos
   - Consulta de envíos (exitosos y fallidos)
   - Métricas y reportes
5. **Servicios Externos**:
   - Servicio de envío de correos (SMTP/SendGrid/SES)
   - Content Manager para almacenar archivos .eml
6. **Integración**: 
   - Sistema de colas para procesamiento asíncrono
   - Webhooks para tracking de correos (opens, clicks)

---

## Vista SQL - Consulta de Estado de Proceso

```sql
-- Resumen de un proceso de envío
SELECT 
    cp.ID_PROCESO,
    p.TIPO_PROCESO,
    p.NEGOCIO,
    em.DESCRIPCION AS ESTADO_PROCESO,
    COUNT(DISTINCT pe.ID_SEQ_PROCESO_DET) AS TOTAL_ENVIADOS,
    COUNT(DISTINCT ne.ID_SEQ_PROCESO_DET) AS TOTAL_NO_ENVIADOS,
    SUM(pe.E_OPENS) AS TOTAL_APERTURAS,
    SUM(pe.E_CLICKS) AS TOTAL_CLICKS
FROM AFIL.AFIL_ENV_CONF_PROCESO cp
INNER JOIN AFIL.AFIL_ENV_PLANTILLAS p ON cp.ID_PLANTILLA = p.ID_PLANTILLA
INNER JOIN AFIL.AFIL_ENV_ESTADOS_MAESTRO em ON cp.ID_ESTADO = em.ID_ESTADO
LEFT JOIN AFIL.AFIL_ENV_PROCESO_ENVIADOS pe ON cp.ID_PROCESO = pe.ID_PROCESO
LEFT JOIN AFIL.AFIL_ENV_NO_ENVIADOS ne ON cp.ID_PROCESO = ne.ID_PROCESO
WHERE cp.ESTADO_REG = 'V'
  AND p.ESTADO_REG = 'V'
GROUP BY 
    cp.ID_PROCESO, 
    p.TIPO_PROCESO, 
    p.NEGOCIO, 
    em.DESCRIPCION
ORDER BY cp.ID_PROCESO DESC;
```

---

## Conclusión

Este modelo de datos representa un **Sistema de Gestión de Envío Masivo de Correos Electrónicos** con:
- ✅ Gestión de plantillas HTML parametrizables
- ✅ Configuración flexible de procesos
- ✅ Tracking completo de métricas de email marketing
- ✅ Manejo robusto de errores y reintentos
- ✅ Auditoría completa con soft delete
- ✅ Integración con Content Manager
- ✅ Soporte para archivos adjuntos

**Dominio de Negocio**: Sistema de Afiliación (AFIL) con capacidades de comunicación masiva por correo electrónico.