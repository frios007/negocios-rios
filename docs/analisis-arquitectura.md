# Análisis técnico de arquitectura y patrones de diseño

**Proyecto:** Sistema de gestión para farmacia — punto de venta, inventario, cartera de clientes y finanzas

---

## 1. Contexto

Se construirá una aplicación web de gestión para una farmacia de tamaño mediano, con cuatro capacidades centrales: punto de venta, control de inventario, cartera de clientes con ventas a crédito, y registro de gastos con reportería básica. Los usuarios previstos son propietario, administrador, farmacéutico y cajero, con permisos diferenciados.

Un requisito condiciona el diseño desde el inicio: el negocio opera —o podrá operar— con más de una sucursal, cada una con su propio inventario, cartera y caja, sobre un único despliegue. La **multi-tenencia** debe contemplarse en la primera versión, no como añadido posterior.

Pila prevista: React + Vite con TanStack Router/Query/Table y Zustand; NestJS con Drizzle ORM, JWT y validación Zod; PostgreSQL con esquemas por contexto; monorepo con pnpm workspaces y Turborepo.

---

## 2. Arquitectura a utilizar

Se adoptará un **monolito modular en capas, multi-inquilino de esquema compartido, expuesto como API REST y consumido por una SPA desacoplada**.

**Cliente–servidor de tres niveles.** El frontend se compilará como aplicación de página única servida estáticamente, sin lógica de negocio. Toda la lógica residirá detrás de una API REST versionada (`/api/v1`) con autenticación por token, lo que permitirá añadir después otros clientes —app móvil, punto de venta de escritorio— sin modificar el backend.

**Monolito modular.** El backend será un único artefacto desplegable, organizado por contexto de negocio (`auth`, `users`, `inventory`, `sale`, `finance`) y, dentro de cada uno, en tres capas con dependencia estrictamente descendente: **Controlador → Servicio → Repositorio**. El controlador solo traducirá HTTP, el servicio contendrá las reglas de negocio, y el repositorio será el único que hable SQL. Un directorio `core/` concentrará la infraestructura y las preocupaciones transversales. La separación en esquemas de PostgreSQL por contexto reforzará esa modularidad en la propia base de datos, sin pagar el costo de bases separadas.

**Multi-tenencia de esquema compartido con columna discriminadora.** Toda tabla de negocio llevará `business_unit_id`. La sucursal activa se resolverá por encabezado HTTP (`X-Business-Unit-ID`): un guard validará el formato, comprobará contra el token que el usuario tenga acceso a esa unidad, y dejará el valor disponible para que el repositorio lo aplique en cada consulta. Se descartan la base de datos por inquilino (costo operativo desproporcionado para el volumen previsto) y la resolución por subdominio (obliga a recargar la aplicación al cambiar de sucursal).

**Frontend por rebanadas verticales.** El cliente se organizará por capacidad de negocio y no por tipo de archivo: cada *feature* contendrá su fachada HTTP, sus consultas, sus hooks y sus componentes. La distinción central será entre **estado de servidor** —propiedad exclusiva de TanStack Query, con caché e invalidación— y **estado de cliente**, limitado a sesión, token y sucursal activa en un store de Zustand; no se replicarán datos de servidor en el store.

---

## 3. Patrones de diseño a aplicar

**Estructurales.** *Layered Architecture* (las tres capas por módulo); *Repository* como único punto de acceso a datos, lo que permitirá sustituir el ORM sin tocar servicios; *Layer Supertype*, una clase base abstracta de repositorio que centralizará el filtro por sucursal y la propagación de transacciones para todos los módulos; *Data Transfer Object* con esquemas Zod validados en la frontera; y *Bounded Context*, con módulos y esquemas de base de datos alineados a los contextos del negocio.

**Creación y dependencias.** *Inyección de dependencias / IoC* mediante el contenedor del framework: ningún servicio instanciará sus colaboradores, lo que los hará testeables. *Factory* con *Injection Token* para el pool de conexiones, sustituible por un doble en pruebas. *Singleton* para el pool y el cliente de caché.

**Transversales (orientación a aspectos).** *Chain of Responsibility* en la cadena de guards globales —límite de peticiones → autenticación → sucursal → roles—, donde cada eslabón puede cortar la petición. *Decorator con metadatos reflexivos*: decoradores propios (`@Public`, `@Roles`, `@ActiveTenant`) que declaran la política junto al endpoint y la leen los guards, evitando repetir controles en cada método. *Interceptor* para envolver toda respuesta en una estructura uniforme. *Error Translator* que traducirá errores del motor de base de datos a códigos HTTP semánticos sin filtrar detalles de infraestructura.

**Dominio y persistencia.** *Unit of Work*: una venta escribe en seis tablas y se ejecutará en una sola transacción, con la conexión propagada a los repositorios. *Money/Quantity*, con aritmética decimal exacta y columnas `numeric(10,2)`, para evitar el error de coma flotante en importes. *Concurrencia optimista (compare-and-swap)*: el descargo de stock incluirá la condición de existencia suficiente en el propio `UPDATE`, de modo que si dos cajas venden la última unidad, una falle explícitamente. *Ledger*: una tabla de movimientos de inventario con tipo, cantidad firmada, usuario y motivo, que da auditoría y permite reconstruir el stock. *Soft delete* para no romper el historial de ventas. *Compensating Transaction* para la anulación, que revertirá stock, asentará movimientos de ajuste y descontará la deuda del cliente. *Strategy* para distinguir artículos con stock de servicios sin stock, en lugar de condicionales repartidos.

**Seguridad.** Autenticación stateless por JWT con secretos separados para acceso y refresco; **rotación de refresh token con detección de reuso** —almacenado hasheado, con revocación total ante discrepancia, conforme a la recomendación de OWASP—; refresco en cookie `HttpOnly` y token de acceso solo en memoria; límite de peticiones global y reforzado en operaciones sensibles; y control de acceso por rol **resuelto por sucursal**, ya que un usuario puede ser cajero en una y administrador en otra.

**Frontend.** *Facade* en las fachadas HTTP por feature, de modo que ningún componente vea axios ni URLs. *Interceptor* que inyecta los encabezados de autorización y de sucursal, para que ningún llamador pueda omitirlos. *Mutex con cola de espera* en el refresco silencioso de token: si varias peticiones reciben 401 a la vez, solo una renueva y el resto espera y se reintenta. *Namespacing de caché por sucursal*, con toda clave de consulta prefijada por la unidad activa y vaciado al conmutar. *Route Guard* que restaura la sesión antes de renderizar.

---

## 4. Ventajas para el proyecto

**La operación central es intrínsecamente transaccional y el monolito la resuelve sin esfuerzo.** Registrar una venta modifica en un solo acto la venta, su detalle, los pagos, el stock, el libro de movimientos y el saldo del cliente. Aquí eso es una transacción ACID; en microservicios sería una saga distribuida con compensaciones e idempotencia para el mismo resultado funcional. La arquitectura queda alineada con la naturaleza del dominio. En la misma línea, se obtiene **consistencia fuerte donde el negocio no admite aproximaciones**: stock y límite de crédito no toleran consistencia eventual, porque vender lo que no hay o exceder un cupo por una ventana de replicación tiene consecuencia económica directa.

**Costo operativo y cognitivo mínimos.** Un proceso de Node, un PostgreSQL y archivos estáticos. Un equipo pequeño puede desplegar, depurar y respaldar esto sin orquestación de contenedores ni trazabilidad distribuida. A ello se suma un solo lenguaje de extremo a extremo, con un monorepo que permitirá compartir los contratos de datos entre cliente y servidor.

**Las preocupaciones transversales se resuelven una sola vez.** Autenticación, tenencia, roles, formato de respuesta y traducción de errores vivirán en `core/` y se aplicarán a todos los endpoints por composición del pipeline; dar de alta un módulo nuevo no obligará a reimplementar nada de eso. Es el beneficio más concreto y medible de la arquitectura, junto con la testabilidad que da la inyección de dependencias.

**Los límites internos quedan donde deben.** Inventario, ventas y finanzas son contextos delimitados reales con esquemas propios: si algún día hiciera falta extraer un servicio, las costuras ya estarán marcadas y la opción de dividir se conserva sin pagarla por adelantado.

---

## 5. Desventajas y riesgos

**El aislamiento entre sucursales dependerá de la disciplina del programador, no del sistema.** Es la debilidad estructural principal de la multi-tenencia por columna discriminadora: el guard valida el encabezado, pero nada obliga a que la consulta aplique el filtro, y un repositorio escrito con prisa devolvería datos de todas las sucursales sin que ninguna capa lo detecte. El riesgo se agrava porque el contexto de seguridad queda partido en dos fuentes que pueden desincronizarse —los permisos vienen del token, la selección de sucursal viene de un encabezado— y un encabezado es el dato más fácil de manipular de una petición. *Mitigación:* la sucursal viajará como *claim* del token y el encabezado actuará solo como selector entre las permitidas; se activará **Row Level Security de PostgreSQL** en toda tabla con `business_unit_id`, fijando el contexto con `SET LOCAL` dentro de la transacción de cada petición; y habrá una prueba de aislamiento por endpoint. Con eso, un filtro olvidado deja de ser una fuga y pasa a devolver cero filas.

**El techo del modelo de dominio anémico.** Con las reglas alojadas en los servicios y entidades que son solo filas del ORM (patrón *Transaction Script*), el método que registra una venta concentrará validación de crédito, cálculo de precios, control de stock y persistencia. Funciona al inicio, pero los requisitos naturales de una farmacia —lotes y vencimientos con FEFO, medicamentos regulados con registro de receta, devoluciones parciales, facturación fiscal— irán añadiendo ramas al mismo método, y las reglas no serán reutilizables por otro caso de uso. *Mitigación:* aceptar el patrón en los módulos CRUD y reservar un modelo de dominio rico para ventas e inventario (§6).

**Un único punto de fallo y escalado vertical.** Un despliegue implica una caída total, y el rendimiento se mejora agrandando la máquina. Además, el estado en memoria del proceso —los contadores del limitador de peticiones— hace que el escalado horizontal no sea transparente: con dos réplicas el límite se duplicaría. *Mitigación:* trasladar ese contador a almacenamiento externo antes de añadir la segunda réplica.

**Riesgos menores, con su mitigación prevista.** *Acoplamiento entre módulos:* nada impide que ventas inyecte repositorios de inventario o clientes, saltándose sus reglas; se establece la norma de consumir servicios y nunca repositorios ajenos, verificada en revisión de código. *Contratos duplicados entre cliente y servidor:* producen deriva silenciosa, y se evitan con un paquete `packages/contracts` de esquemas Zod como única fuente de verdad desde el inicio. *Falta de idempotencia:* un doble clic o un reintento de red generaría dos ventas y dos descargos de stock, por lo que el registro de ventas exigirá clave de idempotencia. *Agregación en memoria:* los reportes que sumen ventas recorriendo colecciones se degradan de forma no lineal con el historial, así que toda agregación se resuelve en SQL y los paneles más costosos se apoyarán en proyecciones de lectura.

---

## 6. Migración de arquitectura

### 6.1 No se migrará a microservicios

Descomponer en microservicios sería un error aquí. La escala prevista —decenas de miles de ventas al año y unos pocos usuarios concurrentes— está muy por debajo de lo que justifica distribuir; la transacción central es indivisible sin convertir una garantía del motor de base de datos en código propio que hace lo mismo peor; y el beneficio principal de los microservicios es organizacional —permitir que varios equipos desplieguen por separado—, mientras su costo se traslada íntegro al plano operativo, que es donde este equipo tiene menos capacidad.

### 6.2 Migración interna prevista

La evolución planificada no cambia la topología del despliegue, sino la estructura interna:

> **De monolito modular en capas → a monolito modular hexagonal, con dominio rico en los contextos críticos, comunicación interna por eventos y frontera de sucursal defendida por la base de datos.**

- **A. Defensa en profundidad de la tenencia.** Claim en el token, Row Level Security y pruebas de aislamiento. Es la prioridad, porque protege el invariante más importante del sistema.
- **B. Puertos y adaptadores en ventas e inventario.** Los repositorios pasan a ser interfaces definidas por el dominio y el ORM se vuelve un adaptador. El núcleo —agregado `Venta`, objetos de valor `Dinero`, `Cantidad`, `LimiteDeCredito`— queda libre del framework y verificable con pruebas unitarias sin base de datos. Se aplicará **solo** a estos dos módulos: hacerlo en catálogos o proveedores, que son CRUD sin invariantes, sería ceremonia sin beneficio. La arquitectura será heterogénea a propósito: profunda donde hay reglas, delgada donde hay formularios.
- **C. Paquete de contratos compartido.** Esquemas Zod como única fuente de verdad para validar en el servidor e inferir tipos en el cliente.
- **D. Bus de eventos en proceso con tabla *outbox*.** Ventas deja de llamar repositorios ajenos y publica `VentaRegistrada`; inventario y finanzas reaccionan. La comunicación pasa a ser por contrato y no por importación, y las proyecciones de lectura resuelven el costo de la reportería.

### 6.3 Planificación

Fases desplegables e independientes: cada una deja el sistema funcionando y aporta valor por sí misma.

| Fase | Alcance | Criterio de aceptación |
|---|---|---|
| **0. Red de seguridad** *(bloqueante)* | Integración continua (lint, tipos, compilación, pruebas). Pruebas de las reglas monetarias: total, estado de pago, límite de crédito, stock insuficiente, anulación. Suite de aislamiento por sucursal. Registro de decisiones de arquitectura (ADR). | La CI corta cualquier regresión; toda regla monetaria con al menos un caso de prueba. |
| **1. Frontera de sucursal** | Claim en el token y encabezado como selector validado contra él. Políticas de Row Level Security con `SET LOCAL` por transacción. Decorador de roles obligatorio en todos los controladores, con **política de fallo cerrado**: sin decorador, se deniega. | Una consulta sin filtro devuelve cero filas; cero endpoints sin control de rol. |
| **2. Contratos compartidos** | `packages/contracts` consumido por ambas aplicaciones; sin interfaces duplicadas. | La verificación de tipos falla si el cliente usa un campo que el servidor no expone. |
| **3. Dominio en ventas e inventario** | Agregados y objetos de valor; `UnitOfWork` inyectable; `Strategy` para artículos y servicios; agregaciones movidas a SQL; idempotencia en ventas. | Las pruebas de la Fase 0 pasan **sin modificarse**: es refactorización pura. |
| **4. Eventos internos** | Bus en proceso y tabla *outbox* en la misma transacción de escritura; proyecciones de lectura para los paneles. | Cero importaciones cruzadas de repositorios; reportes en tiempo constante respecto al historial. |
| **5. Producción y observabilidad** | Empaquetado de la API, migraciones por pipeline, registro estructurado con identificadores de petición, usuario y sucursal, chequeos de salud, métricas, limitador externo, respaldo probado. | Despliegue reproducible con un comando; petición fallida rastreable de extremo a extremo. |

**Riesgos del plan.** El principal es que Row Level Security rompa consultas de forma silenciosa, o que el contexto se filtre entre peticiones por reuso de conexión del pool; se mitiga activando las políticas tabla por tabla detrás de una bandera de configuración, fijando el contexto siempre dentro de una transacción, y con una prueba de concurrencia de dos sucursales simultáneas. El segundo es refactorizar el dominio sin cobertura suficiente, razón por la cual la Fase 0 se declara bloqueante y se aborda un módulo por vez.

### 6.4 Extracción de servicios: condicional y futura

No se planifica con fecha, sino con disparadores: latencia p95 sostenida sobre 500 ms con el monolito ya optimizado, necesidad de que dos equipos desplieguen por separado, o un requisito con ciclo de vida propio como la facturación electrónica. Si ocurre, el procedimiento será *Strangler Fig*, empezando por **reportería** —de solo lectura y ya consumidora de las proyecciones de la Fase 4— y siguiendo por notificaciones o integración fiscal, asíncronas y con canal propio en el *outbox*. **Ventas e inventario no se separan entre sí** salvo que se acepte una saga con compensación, lo que es un cambio de contrato con el negocio y no una decisión técnica. La Fase 4 vuelve esa extracción **posible pero no obligatoria**: ese es el objetivo de un monolito modular bien construido.

---

## 7. Conclusión

El monolito modular en capas, multi-inquilino de esquema compartido y con cliente desacoplado, es la arquitectura adecuada para este proyecto: la operación central es una transacción indivisible sobre seis tablas, la escala prevista no justifica distribuir, y el equipo es pequeño. Sus dos debilidades son estructurales y el plan las ataca de frente: el aislamiento entre sucursales se traslada de una convención de código a una garantía de la base de datos, y las reglas de negocio se concentran en un modelo de dominio en los dos módulos que lo justifican. Al final del plan el sistema seguirá siendo un monolito, con la opción —no la obligación— de dividirse el día que el negocio lo pida.
