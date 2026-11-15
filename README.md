#  Agencia de Superhéroes de Segunda

Aplicación web para registrar héroes con poderes poco espectaculares pero muy útiles: **Capitán Wifi**, **Doctor Cargador**, **Señora Táper**…

Los usuarios crean sus héroes (¡pueden tener varios!) y les asignan poderes de un catálogo. Cada poder tiene un nivel de utilidad del 1 al 10, y el nivel de utilidad del héroe se calcula como **la media de sus poderes**.

Proyecto didáctico del módulo de Backend: **Node.js + Express + Sequelize + PostgreSQL + EJS**, todo levantado con **Docker Compose**.

> ℹ️ **Estado actual:** todavía no hay autenticación. Todas las rutas son públicas y las contraseñas se guardan **en texto plano**. Login con bcrypt + JWT y permisos por rol llegarán en la siguiente fase (ver [Hoja de ruta](#hoja-de-ruta)).

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
| Errores y códigos HTTP | `try/catch` en los controladores + `src/utils/errors.js` |

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

| Usuario | Email | Rol | Héroes |
| --- | --- | --- | --- |
| admin | admin@agencia.test | admin | Capitán Obvio |
| paco | paco@agencia.test | user | Capitán Wifi, El Fantasma del Trastero, El Hombre que Llega Puntual |
| marta | marta@agencia.test | user | La Mujer que Siempre Encuentra Aparcamiento, Doctor Cargador, El Calcetín Desparejado |
| lucia | lucia@agencia.test | user | Señora Táper, Mister Mute, Abuela Radar |
| pepe | pepe@agencia.test | user | *(ninguno)* |

- El poder **Abrir botes imposibles** no lo tiene ningún héroe: sirve para comprobar que tus consultas no pierden registros sin relaciones.
- Las contraseñas del seed ya están guardadas como hash de bcrypt (`admin1234` y `heroe1234`), pensando en la fase de login. Los usuarios que crees ahora desde la app se guardan en texto plano, así que de momento conviven los dos formatos.

---

## Modelo de datos

```
users 1 ────< heroes >────< hero_powers >────< powers
        crea              (N:M)
```

| Tabla | Campos |
| --- | --- |
| `users` | user_id, username, email, password, role (`admin` \| `user`) |
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
│   │   ├── hero/
│   │   │   ├── hero.api.controller.js    # res.json(...)
│   │   │   └── hero.view.controller.js   # res.render(...) / res.redirect(...)
│   │   ├── power/
│   │   └── user/
│   ├── routes/
│   │   ├── router.js             # /api -> api, / -> vistas
│   │   ├── api/
│   │   └── view/
│   ├── utils/
│   │   └── errors.js             # traduce errores de Sequelize a mensaje + código HTTP
│   ├── views/                    # plantillas EJS
│   │   ├── layout/               # header, footer, error
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

### Héroes

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/hero` | Lista con creador, poderes y nivel de utilidad |
| GET | `/api/hero/:id` | Detalle con creador, poderes y nivel de utilidad |
| POST | `/api/hero` | Crea un héroe: `{ name, description, userId }` |
| PUT | `/api/hero/:id` | Sustituye el héroe completo |
| PATCH | `/api/hero/:id` | Cambia solo los campos enviados |
| DELETE | `/api/hero/:id` | Borra un héroe |
| POST | `/api/hero/:id/powers/:powerId` | Asigna un poder existente |
| POST | `/api/hero/:id/powers` | Crea un poder nuevo `{ name, description, utility_level }` y lo asigna |
| DELETE | `/api/hero/:id/powers/:powerId` | Quita un poder (el poder sigue existiendo) |

### Poderes

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/power` | Lista de poderes |
| GET | `/api/power/:id` | Poder con los héroes que lo tienen |
| POST | `/api/power` | Crea un poder: `{ name, description, utility_level }` |
| PUT | `/api/power/:id` | Sustituye el poder completo |
| PATCH | `/api/power/:id` | Cambia solo los campos enviados |
| DELETE | `/api/power/:id` | Borra un poder (y se lo quita a todos los héroes) |

### Usuarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/user` | Lista de usuarios |
| GET | `/api/user/:id` | Usuario con sus héroes |
| POST | `/api/user` | Crea un usuario: `{ username, email, password, role }` |
| PUT | `/api/user/:id` | Sustituye el usuario completo |
| PATCH | `/api/user/:id` | Cambia solo los campos enviados |
| DELETE | `/api/user/:id` | Borra un usuario (y sus héroes) |

### Códigos de estado

| Código | Cuándo |
| --- | --- |
| 200 / 201 | OK / creado |
| 400 | Datos inválidos (falta un campo, nivel fuera de 1–10, `userId` inexistente…) |
| 404 | El recurso no existe |
| 409 | Nombre o email repetido |
| 500 | Error inesperado del servidor |

### Pruébalo con curl

```bash
# Crear un héroe para paco (userId 2)
curl -X POST http://localhost:3000/api/hero \
  -H "Content-Type: application/json" \
  -d '{"name":"La Desatascadora","description":"Ningún fregadero se le resiste.","userId":2}'

# Asignarle un poder existente (11 es el id del héroe recién creado)
curl -X POST http://localhost:3000/api/hero/11/powers/10

# Crear un poder nuevo y asignárselo en el mismo paso
curl -X POST http://localhost:3000/api/hero/11/powers \
  -H "Content-Type: application/json" \
  -d '{"name":"Desatascar sin químicos","description":"Solo con un desatascador y paciencia.","utility_level":8}'

# Ver el héroe con su nivel de utilidad: (6 + 8) / 2 = 7
curl http://localhost:3000/api/hero/11

# Intentar crear otro héroe con el mismo nombre (debe dar 409)
curl -X POST http://localhost:3000/api/hero \
  -H "Content-Type: application/json" \
  -d '{"name":"La Desatascadora","userId":2}'
```

---

## Rutas web

| Ruta | Página |
| --- | --- |
| `/` | Inicio |
| `/hero` | Listado de héroes |
| `/hero/new` | Crear héroe |
| `/hero/:id` | Ficha del héroe: asignar, crear y quitar poderes |
| `/hero/:id/edit` | Editar héroe |
| `/power`, `/power/new`, `/power/:id`, `/power/:id/edit` | Lo mismo para poderes |
| `/user`, `/user/new`, `/user/:id`, `/user/:id/edit` | Lo mismo para usuarios |

Los formularios HTML solo envían GET y POST, así que editar y borrar se hacen con rutas POST (`/hero/:id/edit`, `/hero/:id/delete`, `/hero/:id/powers/:powerId/delete`…).

Si un formulario falla (nombre repetido, contraseñas que no coinciden…), el controlador vuelve a mostrar el mismo formulario con el mensaje de error y los datos que había escrito el usuario.

Mientras no haya login, el creador de un héroe se elige en un desplegable del formulario. Cuando haya autenticación, saldrá del usuario que ha iniciado sesión.

---

## Hoja de ruta

- [x] **Fase 1**: `docker compose up` con la BD cargada, servidor Express y conexión a PostgreSQL con Sequelize.
- [x] **Fase 2**: CRUD de poderes en la API (modelo + repositorio + controlador + rutas).
- [x] **Fase 3**: vistas EJS de poderes reutilizando el repositorio.
- [x] **Fase 4**: héroes y relación N:M con poderes (`include`, asignar y quitar), nivel de utilidad calculado.
- [ ] **Fase 5**: registro, login con bcrypt, JWT y cookie en la web.
- [ ] **Fase 6**: el creador del héroe sale del usuario autenticado, comprobación de propiedad y `requireRole('admin')`.
- [ ] **Extra**: filtro por poder, validación como middleware (por ejemplo, ids no numéricos en la URL), errores centralizados y paginación.

---

## Errores típicos

- **Las tablas no existen, están vacías o les falta una columna**: el volumen ya existía antes de cambiar los scripts de `sql/`. Ejecuta `docker compose down -v` y vuelve a arrancar.
- **`ECONNREFUSED 127.0.0.1:5432` desde la app**: dentro de Docker la BD no está en `localhost`, sino en el contenedor `POSTGRES_HOST`.
- **`port is already allocated`**: ya tienes algo usando `APP_PORT` o `PGADMIN_PORT`. Páralo o cambia el puerto en el `.env`.
- **Instalo un paquete y la app no lo encuentra**: instálalo con `docker compose exec app npm install <paquete>` o reconstruye con `docker compose up --build`.
- **nodemon no recarga al guardar** (Windows/macOS): añade `--legacy-watch` al script `dev` del `package.json`.
- **`/hero/new` devuelve "héroe no encontrado"**: has declarado `/hero/:id` antes que `/hero/new`.
- **El nivel de utilidad del héroe sale vacío**: no has hecho `include` de los poderes al leerlo, y el campo virtual no tiene con qué calcular.
- **La API devuelve la contraseña**: usa `attributes: { exclude: ['password'] }` en el repositorio.
- **`column "createdAt" does not exist`**: te falta `underscored: true` en la configuración del modelo.
