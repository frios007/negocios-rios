# Análisis de la tecnología Backend

**Proyecto:** Sistema de gestión para farmacia: punto de venta, inventario, cartera de clientes y finanzas.

---

## 1. Tecnología utilizada

| Componente | Tecnología | Aporte al proyecto |
|---|---|---|
| Entorno de ejecución | **Node.js** + **TypeScript** | Un solo lenguaje en cliente y servidor; el tipado estático detecta errores en tiempo de compilación. |
| Framework | **NestJS 11** (sobre Express) | Arquitectura modular, inyección de dependencias nativa y un pipeline de peticiones (guards, pipes, interceptores, filtros) para resolver aspectos transversales una sola vez. |
| Base de datos | **PostgreSQL** | Motor relacional con transacciones ACID, necesarias para que una venta, el descargo de stock y el saldo del cliente se registren de forma atómica. |
| Acceso a datos | **Drizzle ORM** + **drizzle-kit** | Consultas tipadas cercanas a SQL, sin sobrecarga en tiempo de ejecución, y migraciones versionadas en el repositorio. |
| Validación | **Zod** (`nestjs-zod`) | Los datos de entrada se validan en la frontera de la API con esquemas declarativos que además generan los tipos de TypeScript. |
| Seguridad | **JWT**, **bcrypt**, **Helmet**, **@nestjs/throttler** | Autenticación sin estado, contraseñas y tokens almacenados como hash, encabezados HTTP seguros y límite de peticiones contra fuerza bruta. |
| Aritmética monetaria | **decimal.js** + columnas `numeric(10,2)` | Cálculo exacto de importes, sin el error de redondeo propio del punto flotante. |
| Infraestructura | **Docker**, **pnpm workspaces**, **Turborepo** | Base de datos reproducible en desarrollo y un monorepo con compilación incremental para frontend y backend. |

La API se expone como servicio **REST versionado** (`/api/v1`) y la consume una aplicación de página única (SPA) en React, por lo que el backend concentra toda la lógica de negocio y puede atender más adelante a otros clientes, como una aplicación móvil, sin modificaciones.

---

## 2. Patrón de diseño utilizado

### 2.1 Patrón arquitectónico: monolito modular en capas

El backend es un único artefacto desplegable organizado por **contextos de negocio** (`auth`, `users`, `inventory`, `sale`, `finance`). Cada módulo sigue tres capas con dependencia estrictamente descendente:

```
Controlador  →  Servicio  →  Repositorio  →  PostgreSQL
 (HTTP)        (reglas de       (único punto
               negocio)          de acceso SQL)
```

Esta separación se refleja también en la base de datos, con un esquema de PostgreSQL por contexto (`core`, `inventory`, `sales`). Se eligió el monolito frente a los microservicios porque la operación central, la venta, es indivisible: en un único proceso basta una transacción de base de datos, mientras que repartida entre servicios exigiría coordinación distribuida, un costo que no se justifica en una farmacia con pocos usuarios concurrentes.

### 2.2 Patrones de diseño aplicados

| Patrón | Aplicación en el proyecto |
|---|---|
| **Repository** | Cada módulo accede a los datos solo mediante su repositorio; los servicios no conocen SQL ni el ORM. |
| **Layer Supertype** | La clase abstracta `Database` hereda a todos los repositorios el filtro por sucursal (`withTenant`) y la propagación de transacciones (`getClient`). |
| **Inyección de dependencias / IoC** | El contenedor de NestJS crea y entrega los colaboradores de cada servicio, lo que los hace sustituibles en pruebas. |
| **Factory + Singleton** | El pool de conexiones se registra mediante un *injection token* y se comparte como instancia única. |
| **Data Transfer Object** | Los DTO, definidos con esquemas Zod, establecen el contrato de entrada de cada endpoint. |
| **Chain of Responsibility** | Guards globales encadenados: límite de peticiones → autenticación → sucursal → roles. Cualquier eslabón puede rechazar la petición. |
| **Decorator** | Decoradores propios (`@Public`, `@Roles`, `@SkipTenantGuard`, `@ActiveTenant`) declaran la política de acceso junto al endpoint. |
| **Interceptor** y **Exception Filter** | Toda respuesta se devuelve con un formato uniforme y los errores se traducen a códigos HTTP sin exponer detalles internos. |
| **Unit of Work** | El registro y la anulación de una venta se ejecutan en una sola transacción que abarca venta, detalle, pagos, stock, movimientos y saldo del cliente. |
| **Concurrencia optimista** | El descargo de stock incluye la condición de existencia suficiente en el propio `UPDATE`; si dos cajas venden la última unidad, una de las operaciones falla explícitamente. |
| **Ledger** | La tabla de movimientos de inventario registra cada entrada y salida con usuario y motivo, lo que permite auditar y reconstruir el stock. |
| **Compensating Transaction** | La anulación de una venta revierte el stock, registra los movimientos de ajuste y descuenta la deuda del cliente. |
| **Soft delete** | Productos y clientes se desactivan (`is_active`) en lugar de eliminarse, para conservar el historial de ventas. |

---

## 3. Estrategias de desarrollo

1. **Diseño orientado al dominio.** Los módulos, carpetas y esquemas de base de datos se definieron a partir de las áreas del negocio (inventario, ventas, finanzas) y no de la tecnología, de modo que cada cambio funcional queda localizado en un solo módulo.
2. **Resolución centralizada de aspectos transversales.** Autenticación, autorización, sucursal activa, validación, formato de respuesta y manejo de errores se configuran globalmente en `core/` y en `main.ts`. Un módulo nuevo los hereda sin escribir código adicional.
3. **Multi-sucursal desde la primera versión.** Toda tabla de negocio incluye `business_unit_id`. Un guard valida que el usuario tenga acceso a la sucursal indicada en el encabezado `X-Business-Unit-ID` y los repositorios aplican el filtro en cada consulta. Los roles se asignan por sucursal.
4. **Seguridad por defecto.** Todos los endpoints exigen autenticación salvo que se marquen como públicos. Se usan tokens de acceso de corta duración y *refresh tokens* rotativos guardados como hash, con revocación total de la sesión si se detecta reutilización, según la recomendación de OWASP.
5. **Integridad de datos ante todo.** Transacciones ACID, aritmética decimal exacta y control de concurrencia en el stock, porque en una farmacia un error de inventario o de cobro tiene consecuencia económica directa.
6. **Esquema como código.** El modelo de datos está definido en TypeScript con Drizzle y genera migraciones versionadas en Git. Los *seeders* pueblan entornos de desarrollo y *staging* de forma reproducible.
7. **Monorepo con Turborepo.** Frontend y backend conviven en un repositorio con tareas de compilación, *lint* y verificación de tipos orquestadas y cacheadas, lo que agiliza la integración continua.

---

## 4. Aporte de la tecnología backend al proyecto

- **Confiabilidad transaccional:** PostgreSQL y el patrón *Unit of Work* garantizan que una venta se registre completa o no se registre, sin dejar el inventario o la cartera inconsistentes.
- **Mantenibilidad:** la estructura modular y en capas de NestJS separa responsabilidades y permite incorporar requisitos propios de una farmacia, como el control de lotes y vencimientos, sin afectar los módulos existentes.
- **Seguridad:** el pipeline de guards aplica autenticación, control por rol y aislamiento por sucursal a todos los endpoints de forma uniforme.
- **Bajo costo operativo:** un proceso Node.js y una base de datos PostgreSQL son suficientes para operar, lo cual es adecuado para un equipo de desarrollo reducido.
- **Escalabilidad funcional:** la API REST desacoplada admite nuevos clientes, y los límites entre módulos ya definidos permitirían extraer servicios independientes en el futuro si el volumen lo justificara.

---

## 5. Repositorio

**URL del repositorio de GitHub:** `[INSERTAR_URL_DEL_REPOSITORIO]`
