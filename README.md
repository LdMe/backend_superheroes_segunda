#  Agencia de Superhéroes de Segunda

Aplicación web para registrar héroes con poderes poco espectaculares pero muy útiles: **Capitán Wifi**, **Doctor Cargador**, **Señora Táper**…

Cualquiera puede consultar héroes y poderes. Los usuarios registrados crean sus héroes (¡pueden tener varios!) y les asignan poderes de un catálogo; el administrador gestiona el catálogo de poderes y los usuarios. Cada poder tiene un nivel de utilidad del 1 al 10, y el nivel de utilidad del héroe se calcula como **la media de sus poderes**.

Proyecto didáctico del módulo de Backend (la memoria técnica completa, con requisitos, casos de uso y diagramas, está en [docs/memoria.md](docs/memoria.md)): **Node.js + Express + Sequelize + PostgreSQL + EJS + bcrypt + sesiones + JWT**, todo levantado con **Docker Compose**.

---

## Qué vas a practicar

| Concepto | Dónde aparece |
| --- | --- |
| MVC + capa de repositorios | `routes → controllers → repositories → models` |
| Dos interfaces, una lógica | Controladores `*.view.controller.js` (EJS) y `*.api.controller.js` (JSON) usan los mismos repositorios |
| Relación 1:N | Un `User` crea muchos `Hero` |
| Relación N:M | `Hero` ↔ `Power` a través de `hero_powers` (`addPower`, `removePower`) |
| Campo calculado | `Hero.utility_level` es un campo `VIRTUAL`: la media de sus poderes |
| Controlador que coordina repositorios | Crear un poder nuevo desde la ficha del héroe y asignárselo |
| Errores y códigos HTTP | Clases de error con `status` en `src/utils/errors.js`; los repositorios las lanzan y los controladores responden con `error.status` |
| Contraseñas con bcrypt | Hooks `beforeCreate` / `beforeUpdate` del modelo `User` |
| Autenticación en vistas | Sesión con `express-session` (`req.session.user`) |
| Autenticación en la API | Token JWT en la cabecera `Authorization: Bearer <token>` |
| Autorización por rol | Middleware `hasRole("admin")`: solo el admin gestiona poderes y usuarios |
| Autorización por propiedad | Middleware `isHeroOwner`: solo el creador (o el admin) edita o borra un héroe |
| Validar parámetros de la URL | `router.param("id", isValidId)`: un id no numérico da 400 antes de llegar al controlador |
| Filtro y paginación | `GET /hero?power=3&page=2`: `findAndCountAll` con `limit`, `offset` y `distinct` |
| 404 y errores sin capturar | `notFound` al final de cada router y `errorHandler` al final de `index.js` |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + plugin Compose)
- Un cliente HTTP para probar la API: curl, Thunder Client, Postman o Bruno

No hace falta instalar PostgreSQL. Node.js en local solo es necesario si quieres que el editor tenga autocompletado de las dependencias.

---

## Puesta en marcha

### Servicios

| Servicio | Qué es | URL |
| --- | --- | --- |
| `app` | Node + Express con nodemon (recarga al guardar) | `http://localhost:${APP_PORT}` |
| `postgres` | PostgreSQL 18, se carga solo con los scripts de `sql/` | (no se publica fuera de Docker) |
| `pgadmin` | Cliente web para ver la base de datos | `http://localhost:${PGADMIN_PORT}` |

### 1. Variables de entorno

```bash
cp .env.example .env
```

Rellena los valores. Por ejemplo:

```env
APP_HOST=superheroes
APP_PORT=3000

POSTGRES_HOST=superdatos
POSTGRES_USER=user
POSTGRES_PASSWORD=una-contraseña
POSTGRES_DB=superheroes

PGADMIN_HOST=pgadmin_superheroes
PGADMIN_PORT=8082
PGADMIN_EMAIL=admin@mail.com
PGADMIN_PASSWORD=otra-contraseña

# secretos para firmar los tokens JWT y las cookies de sesión
# (cualquier texto largo y aleatorio, por ejemplo: openssl rand -hex 32)
JWT_SECRET=un-texto-largo-y-aleatorio
SESSION_SECRET=otro-texto-largo-y-aleatorio
```

El `.env` no se sube a Git. Docker Compose lo usa para nombrar los contenedores y crear la base de datos, y la app lo lee con `dotenv`. `POSTGRES_HOST` es también el nombre del contenedor de PostgreSQL, que es como lo encuentra la app dentro de la red de Docker.

### 2. Arrancar

```bash
docker compose up --build
```

La primera vez, PostgreSQL ejecuta automáticamente los scripts de `sql/` por orden alfabético:

1. `01_schema.sql`: crea las tablas.
2. `02_seed.sql`: carga los datos de ejemplo.

Abre `http://localhost:<APP_PORT>`.

### Comandos habituales

| Comando | Para qué |
| --- | --- |
| `docker compose up --build` | Arrancar (y reconstruir si cambió `package.json`) |
| `docker compose up -d` | Arrancar en segundo plano |
| `docker compose logs -f app` | Ver los logs de la app |
| `docker compose down` | Parar. **Los datos se conservan** |
| `docker compose down -v` | Parar y **borrar la base de datos**. Al volver a arrancar se recarga desde `sql/` |
| `docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'` | Abrir una consola SQL |
| `docker compose exec app npm install` | Instalar en el contenedor las dependencias nuevas del `package.json` |
| `docker compose exec app npm install <paquete>` | Instalar un paquete dentro del contenedor |

> ⚠️ Los scripts de `sql/` **solo se ejecutan si el volumen de datos está vacío**. Si cambias el esquema o los datos, necesitas `docker compose down -v` para que se vuelvan a aplicar.

Para restaurar los datos de ejemplo sin borrar el volumen (solo si el esquema no ha cambiado):

```bash
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < sql/02_seed.sql
```

### Conectarse a la base de datos

- **pgAdmin** (`http://localhost:<PGADMIN_PORT>`): entra con `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` y registra un servidor con host `POSTGRES_HOST` (el nombre del contenedor), puerto `5432` y el usuario y contraseña del `.env`.

---

## Datos de ejemplo

Todos los usuarios del seed tienen la contraseña **`1234`** (guardada como hash de bcrypt).

| Usuario | Email | Rol | Héroes |
| --- | --- | --- | --- |
| admin | admin@agencia.test | admin | Capitán Obvio |
| paco | paco@agencia.test | user | Capitán Wifi, El Fantasma del Trastero, El Hombre que Llega Puntual |
| marta | marta@agencia.test | user | La Mujer que Siempre Encuentra Aparcamiento, Doctor Cargador, El Calcetín Desparejado |
| lucia | lucia@agencia.test | user | Señora Táper, Mister Mute, Abuela Radar |
| pepe | pepe@agencia.test | user | *(ninguno)* |

- El poder **Abrir botes imposibles** no lo tiene ningún héroe: sirve para comprobar que tus consultas no pierden registros sin relaciones.
- Con `paco` y `marta` puedes comprobar la autorización por propiedad: Marta no puede editar los héroes de Paco (403), el admin sí.

---

## Modelo de datos

```
users 1 ────< heroes >────< hero_powers >────< powers
        crea              (N:M)
```

| Tabla | Campos |
| --- | --- |
| `users` | user_id, username, email, password (hash bcrypt), role (`admin` \| `user`) |
| `heroes` | hero_id, name, description, user_id → users |
| `powers` | power_id, name, description, utility_level (1–10) |
| `hero_powers` | hero_id → heroes, power_id → powers (PK compuesta) |

Todas las tablas tienen `created_at` y `updated_at`. Al borrar un usuario se borran sus héroes, y al borrar un héroe o un poder se borran sus filas de `hero_powers` (`ON DELETE CASCADE`).

### Nivel de utilidad del héroe (campo calculado)

El héroe **no guarda** su nivel de utilidad: se calcula a partir de sus poderes con un campo `VIRTUAL` de Sequelize, que no existe en la base de datos.

```javascript
// src/models/hero.model.js
utility_level: {
    type: DataTypes.VIRTUAL,
    get() {
        const powers = this.powers;
        if (!powers) return null;            // no se han cargado los poderes
        if (powers.length === 0) return 0;   // héroe sin poderes
        const total = powers.reduce((sum, power) => sum + power.utility_level, 0);
        return Math.round(total / powers.length * 10) / 10;  // media con 1 decimal
    }
}
```

Para que funcione, hay que cargar los poderes al leer el héroe (`include: { model: Power, as: "powers" }`). Por eso `heroRepository.getAll` y `getById` siempre los incluyen.

### Configuración de Sequelize para que encaje con el esquema

Las tablas están en `snake_case` y en plural. En cada modelo usamos:

```javascript
{
    tableName: "heroes",
    timestamps: true,
    underscored: true   // heroId <-> hero_id, userId <-> user_id, createdAt <-> created_at
}
```

```javascript
// src/models/index.js
User.hasMany(Hero, { foreignKey: 'userId', as: 'heroes' });
Hero.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Hero.belongsToMany(Power, { through: "hero_powers", as: "powers", foreignKey: "heroId" });
Power.belongsToMany(Hero, { through: "hero_powers", as: "heroes", foreignKey: "powerId" });
```

Con `as: "powers"`, Sequelize añade a cada héroe los métodos `addPower`, `removePower`, `getPowers`, `setPowers`…

> ⚠️ Como el esquema lo crea `sql/01_schema.sql`, **no** uses `sequelize.sync({ force: true })`: borraría las tablas.

---

## Autenticación y autorización

La web y la API comparten repositorios, pero cada una recuerda al usuario de una forma distinta:

| | Vistas (EJS) | API (JSON) |
| --- | --- | --- |
| Login | `POST /auth/login` guarda `{ userId, username, role }` en `req.session.user` | `POST /api/auth/login` devuelve un token JWT con `{ userId, role }` (caduca en 1 h) |
| Cómo se envía | Cookie de sesión (la gestiona el navegador) | Cabecera `Authorization: Bearer <token>` |
| Logout | `GET /auth/logout` destruye la sesión | No hay: el cliente olvida el token |
| Sin permiso | Redirección al login o página de error | JSON `{ error }` con 401 / 403 |

Las contraseñas nunca se guardan en claro: el modelo `User` las hashea con bcrypt en los hooks `beforeCreate` y `beforeUpdate`, y el login las compara con `bcrypt.compare`. Si falla el email o la contraseña, la respuesta es la misma ("Credenciales incorrectas"), para no revelar qué emails existen.

### Middlewares (`src/middlewares/auth.middleware.js`)

Hay una versión para vistas y otra para la API, igual que con los controladores. Las dos dejan el usuario en `req.user = { userId, role }`, así que los controladores no saben de dónde viene.

| Vistas | API | Qué comprueba | Si falla |
| --- | --- | --- | --- |
| `isAuthenticated` | `isAuthenticatedApi` | Hay sesión / el token es válido y no ha caducado | Login / 401 |
| `hasRole("admin")` | `hasRoleApi("admin")` | El usuario tiene ese rol | 403 |
| `isHeroOwner` | `isHeroOwnerApi` | El héroe `:id` es suyo, o es admin | 404 si no existe, 403 si no es suyo |

Se encadenan en la ruta, en orden. Los de rol y propiedad necesitan `req.user`, así que van siempre después del de autenticación:

```javascript
// src/routes/view/hero.router.js
router.post("/:id/delete", isAuthenticated, isHeroOwner, heroViewController.remove);

// src/routes/api/power.router.js
router.post("/", isAuthenticatedApi, hasRoleApi("admin"), powerApiController.create);
```

### Quién puede hacer qué

| Acción | Visitante | Usuario | Admin |
| --- | --- | --- | --- |
| Registrarse e iniciar sesión | Sí | — | — |
| Ver héroes y poderes | Sí | Sí | Sí |
| Crear un héroe (el creador es siempre el usuario logueado) | No | Sí | Sí |
| Editar / borrar un héroe | No | Solo los suyos | Todos |
| Asignar, quitar o crear poderes desde la ficha del héroe | No | Solo en los suyos | En todos |
| Crear, editar y borrar poderes del catálogo (`/power`) | No | No | Sí |
| Ver "Mis héroes" (`/user/me`) | No | Sí | Sí |
| Gestionar usuarios (`/user`) | No | No | Sí |

- El registro público siempre crea usuarios con rol `user`, aunque se envíe otro rol. Los admins se crean desde la gestión de usuarios (por otro admin) o desde la base de datos.
- Un usuario puede crear un poder nuevo **desde la ficha de su héroe**, pero editar o borrar poderes del catálogo es solo para el admin. Si preferís que crear poderes también sea solo de admin, basta con añadir `hasRole("admin")` a la ruta `POST /hero/:id/powers/new` (y `hasRoleApi("admin")` a `POST /api/hero/:id/powers`).
- En las vistas, los botones de editar/borrar solo se muestran a quien puede usarlos (`currentUser` está disponible en todas las vistas), pero **la comprobación de verdad la hacen los middlewares**: esconder un botón no protege nada.

---

## Estructura del proyecto

```
backend_superheroes_segunda/
├── sql/                          # se ejecutan al crear el contenedor de la BD
│   ├── 01_schema.sql
│   └── 02_seed.sql
├── public/
│   ├── css/style.css
│   └── js/main.js                # confirmación antes de borrar (data-confirm)
├── src/
│   ├── config/
│   │   └── db.js                 # conexión de Sequelize
│   ├── models/
│   │   ├── user.model.js
│   │   ├── hero.model.js
│   │   ├── power.model.js
│   │   └── index.js              # asociaciones
│   ├── repositories/             # ÚNICA capa que usa los modelos
│   │   ├── user.repository.js
│   │   ├── hero.repository.js
│   │   └── power.repository.js
│   ├── controllers/
│   │   ├── auth/
│   │   │   ├── auth.api.controller.js    # login con JWT
│   │   │   └── auth.view.controller.js   # login con sesión
│   │   ├── hero/
│   │   │   ├── hero.api.controller.js    # res.json(...)
│   │   │   └── hero.view.controller.js   # res.render(...) / res.redirect(...)
│   │   ├── power/
│   │   └── user/
│   ├── routes/
│   │   ├── router.js             # /api -> api, / -> vistas
│   │   ├── api/
│   │   └── view/
│   ├── middlewares/
│   │   ├── auth.middleware.js        # isAuthenticated, hasRole, isHeroOwner (+ versiones Api)
│   │   ├── validation.middleware.js  # isValidId (+ Api), se usa con router.param
│   │   └── error.middleware.js       # notFound (+ Api) y errorHandler
│   ├── utils/
│   │   ├── errors.js             # clases de error con status (NotFoundError, ForbiddenError...) y throwError
│   │   └── query.js              # checkId y lectura de ?power=&page=&limit=
│   ├── views/                    # plantillas EJS
│   │   ├── error.ejs             # página de error (403, 404...)
│   │   ├── layout/               # header, footer, error
│   │   ├── auth/                 # login, register
│   │   ├── hero/
│   │   ├── power/
│   │   └── user/
│   └── index.js
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## API REST

Todas las respuestas son JSON: `{ "data": ... }` si todo va bien, `{ "error": "mensaje" }` si no. Las respuestas de usuarios **nunca** incluyen la contraseña.

Las rutas protegidas necesitan la cabecera `Authorization: Bearer <token>`.

### Autenticación

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Público | Crea un usuario con rol `user`: `{ username, email, password }` |
| POST | `/api/auth/login` | Público | `{ email, password }` → `{ data: { token, user } }` |

### Héroes

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/hero` | Público | Lista paginada con creador, poderes y nivel de utilidad. Opcional: `?power=<id>&page=<n>&limit=<n>` |
| GET | `/api/hero/:id` | Público | Detalle con creador, poderes y nivel de utilidad |
| POST | `/api/hero` | Usuario | Crea un héroe: `{ name, description }`. El creador sale del token |
| PUT | `/api/hero/:id` | Creador o admin | Sustituye nombre y descripción |
| PATCH | `/api/hero/:id` | Creador o admin | Cambia solo los campos enviados |
| DELETE | `/api/hero/:id` | Creador o admin | Borra un héroe |
| POST | `/api/hero/:id/powers/:powerId` | Creador o admin | Asigna un poder existente |
| POST | `/api/hero/:id/powers` | Creador o admin | Crea un poder nuevo `{ name, description, utility_level }` y lo asigna |
| DELETE | `/api/hero/:id/powers/:powerId` | Creador o admin | Quita un poder (el poder sigue existiendo) |

### Poderes

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/power` | Público | Lista de poderes |
| GET | `/api/power/:id` | Público | Poder con los héroes que lo tienen |
| POST | `/api/power` | Admin | Crea un poder: `{ name, description, utility_level }` |
| PUT | `/api/power/:id` | Admin | Sustituye el poder completo |
| PATCH | `/api/power/:id` | Admin | Cambia solo los campos enviados |
| DELETE | `/api/power/:id` | Admin | Borra un poder (y se lo quita a todos los héroes) |

### Usuarios

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/user/me` | Usuario | El usuario del token, con sus héroes |
| GET | `/api/user` | Admin | Lista de usuarios |
| GET | `/api/user/:id` | Admin | Usuario con sus héroes |
| POST | `/api/user` | Admin | Crea un usuario: `{ username, email, password, role }` |
| PUT | `/api/user/:id` | Admin | Sustituye el usuario completo |
| PATCH | `/api/user/:id` | Admin | Cambia solo los campos enviados |
| DELETE | `/api/user/:id` | Admin | Borra un usuario (y sus héroes) |

### Filtro y paginación del listado de héroes

`GET /api/hero` (y la página `/hero`) acepta tres parámetros opcionales en la query:

| Parámetro | Por defecto | Qué hace |
| --- | --- | --- |
| `power` | — | Solo los héroes que tienen ese poder. Si no es un id válido → 400; si el poder no existe → 404 |
| `page` | `1` | Página que se pide. Si no es válida, vuelve a la 1 |
| `limit` | `6` | Héroes por página (máximo 50). Con los 10 del seed, salen 2 páginas |

```jsonc
// GET /api/hero?power=3&page=1
{
  "data": [ { "heroId": 3, "name": "El Hombre que Llega Puntual", "utility_level": 6, "powers": [ ... ] }, ... ],
  "pagination": { "page": 1, "limit": 6, "total": 3, "totalPages": 1 }
}
```

Al filtrar, cada héroe sigue trayendo **todos** sus poderes, así que su nivel de utilidad es correcto.

### Códigos de estado

| Código | Cuándo |
| --- | --- |
| 200 / 201 | OK / creado |
| 400 | Datos inválidos (falta un campo, nivel fuera de 1–10, id de la URL que no es un número…) |
| 401 | Sin token, token inválido o caducado, o credenciales incorrectas |
| 403 | Autenticado, pero sin permiso (no es admin, o el héroe no es suyo) |
| 404 | El recurso o el endpoint no existe |
| 409 | Nombre, email o username repetido |
| 500 | Error inesperado del servidor |

### Pruébalo con curl

```bash
# Login como paco (todos los usuarios del seed tienen la contraseña 1234)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"paco@agencia.test","password":"1234"}'

# Guarda el token de la respuesta
TOKEN=pega-aqui-el-token

# Sin token no se puede crear un héroe (401)
curl -X POST http://localhost:3000/api/hero \
  -H "Content-Type: application/json" \
  -d '{"name":"La Desatascadora"}'

# Con token sí. El creador será paco, aunque enviaras otro userId en el body
curl -X POST http://localhost:3000/api/hero \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"La Desatascadora","description":"Ningún fregadero se le resiste."}'

# Asignarle un poder existente (11 es el id del héroe recién creado)
curl -X POST http://localhost:3000/api/hero/11/powers/10 \
  -H "Authorization: Bearer $TOKEN"

# Crear un poder nuevo y asignárselo en el mismo paso
curl -X POST http://localhost:3000/api/hero/11/powers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Desatascar sin químicos","description":"Solo con un desatascador y paciencia.","utility_level":8}'

# Ver el héroe con su nivel de utilidad: (6 + 8) / 2 = 7
curl http://localhost:3000/api/hero/11

# Héroes con el poder "Puntualidad sobrehumana" (id 3), y segunda página del listado
curl "http://localhost:3000/api/hero?power=3"
curl "http://localhost:3000/api/hero?page=2"

# Intentar borrar un héroe de marta (403)
curl -X DELETE http://localhost:3000/api/hero/4 \
  -H "Authorization: Bearer $TOKEN"

# Intentar crear un poder en el catálogo sin ser admin (403)
curl -X POST http://localhost:3000/api/power \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Plegar sábanas bajeras","utility_level":9}'
```

---

## Rutas web

| Ruta | Página | Acceso |
| --- | --- | --- |
| `/` | Inicio | Público |
| `/auth/register`, `/auth/login` | Registro y login | Público |
| `/auth/logout` | Cerrar sesión | Usuario |
| `/hero`, `/hero/:id` | Listado (con filtro `?power=` y paginación `?page=`) y ficha de héroes | Público |
| `/hero/new` | Crear héroe | Usuario |
| `/hero/:id/edit`, `/hero/:id/delete` | Editar y borrar héroe | Creador o admin |
| `/hero/:id/powers…` | Asignar, crear y quitar poderes (desde la ficha) | Creador o admin |
| `/power`, `/power/:id` | Listado y ficha de poderes | Público |
| `/power/new`, `/power/:id/edit`, `/power/:id/delete` | Gestionar el catálogo de poderes | Admin |
| `/user/me` | Mis héroes | Usuario |
| `/user`, `/user/new`, `/user/:id`, `/user/:id/edit`… | Gestionar usuarios | Admin |

Los formularios HTML solo envían GET y POST, así que editar y borrar se hacen con rutas POST (`/hero/:id/edit`, `/hero/:id/delete`, `/hero/:id/powers/:powerId/delete`…).

Si un formulario falla (nombre repetido, contraseñas que no coinciden…), el controlador vuelve a mostrar el mismo formulario con el mensaje de error y los datos que había escrito el usuario. En el login y el registro, los mensajes llegan por la query (`/auth/login?error=...`) y las vistas los leen de `query`.

---

## Hoja de ruta

- [x] **Fase 1**: `docker compose up` con la BD cargada, servidor Express y conexión a PostgreSQL con Sequelize.
- [x] **Fase 2**: CRUD de poderes en la API (modelo + repositorio + controlador + rutas).
- [x] **Fase 3**: vistas EJS de poderes reutilizando el repositorio.
- [x] **Fase 4**: héroes y relación N:M con poderes (`include`, asignar y quitar), nivel de utilidad calculado.
- [x] **Fase 5**: registro, login con bcrypt, sesión en la web y JWT en la API.
- [x] **Fase 6**: el creador del héroe sale del usuario autenticado, comprobación de propiedad (`isHeroOwner`) y de rol (`hasRole("admin")`).
- [x] **Extra**: filtro por poder, paginación, validación de ids con `router.param` y manejo de 404 / errores sin capturar.

Posibles ampliaciones para vuestros proyectos: búsqueda por texto (`?q=`), ordenación (`?sort=`), subida de imágenes, tests automáticos y despliegue.

---

## Errores típicos

- **Las tablas no existen, están vacías o les falta una columna**: el volumen ya existía antes de cambiar los scripts de `sql/`. Ejecuta `docker compose down -v` y vuelve a arrancar.
- **`ECONNREFUSED 127.0.0.1:5432` desde la app**: dentro de Docker la BD no está en `localhost`, sino en el contenedor `POSTGRES_HOST`.
- **`port is already allocated`**: ya tienes algo usando `APP_PORT` o `PGADMIN_PORT`. Páralo o cambia el puerto en el `.env`.
- **`Cannot find package 'express-session'` (o cualquier paquete nuevo)**: el `node_modules` del contenedor vive en un volumen aparte y no se actualiza solo al cambiar el `package.json`. Ejecuta `docker compose exec app npm install` o reconstruye con `docker compose up --build`.
- **`secret option required for sessions` o `secretOrPrivateKey must have a value`**: faltan `SESSION_SECRET` o `JWT_SECRET` en el `.env`.
- **nodemon no recarga al guardar** (Windows/macOS): añade `--legacy-watch` al script `dev` del `package.json`.
- **`/hero/new` devuelve "héroe no encontrado"**: has declarado `/hero/:id` antes que `/hero/new`.
- **Cualquiera puede crear héroes a nombre de otro**: estás leyendo `userId` de `req.body`. Debe salir de `req.user.userId`.
- **El middleware de rol falla con `Cannot read properties of undefined (reading 'role')`**: has puesto `hasRole` antes de `isAuthenticated`, y todavía no existe `req.user`.
- **La cabecera muestra el usuario equivocado en las vistas de usuarios**: en las vistas, el usuario logueado es `currentUser`; `user` es el usuario que se está mostrando.
- **El listado filtrado enseña cada héroe con un solo poder y la media mal**: has filtrado con un `where` dentro del `include` de poderes. Busca primero los ids de los héroes que tienen el poder y filtra los héroes por esos ids (ver `heroRepository.getAll`).
- **El total de la paginación sale más alto de lo que debería**: `findAndCountAll` con un `include` N:M cuenta filas del JOIN. Añade `distinct: true`.
- **El nivel de utilidad del héroe sale vacío**: no has hecho `include` de los poderes al leerlo, y el campo virtual no tiene con qué calcular.
- **La API devuelve la contraseña**: usa `attributes: { exclude: ['password'] }` en el repositorio.
- **`column "createdAt" does not exist`**: te falta `underscored: true` en la configuración del modelo.
