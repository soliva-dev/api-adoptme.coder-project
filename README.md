# AdoptMe API — Trabajo Final Backend III

API REST de adopción de mascotas construida con Node.js, Express y MongoDB. Incluye tests funcionales, imagen Docker optimizada y documentación Swagger.

---

## Estructura del proyecto

```
programacion-backend-3/
├── src/
│   ├── app.js                    ← App Express (sin listen, testeable)
│   ├── server.js                 ← Entry point: conecta DB y levanta el servidor
│   ├── controllers/
│   │   ├── adoptions.controller.js
│   │   ├── pets.controller.js
│   │   ├── sessions.controller.js
│   │   └── users.controller.js
│   ├── dao/
│   │   ├── Adoption.js
│   │   ├── Pets.dao.js
│   │   ├── Users.dao.js
│   │   └── models/
│   │       ├── Adoption.js
│   │       ├── Pet.js
│   │       └── User.js
│   ├── docs/
│   │   └── swagger.js            ← Configuración de Swagger/OpenAPI
│   ├── dto/
│   │   ├── Pet.dto.js
│   │   └── User.dto.js
│   ├── repository/
│   │   ├── GenericRepository.js
│   │   ├── AdoptionRepository.js
│   │   ├── PetRepository.js
│   │   └── UserRepository.js
│   ├── routes/
│   │   ├── adoption.router.js    ← Router principal testeado
│   │   ├── pets.router.js
│   │   ├── sessions.router.js
│   │   └── users.router.js
│   ├── services/
│   │   └── index.js
│   └── utils/
│       ├── index.js
│       └── uploader.js
├── test/
│   └── adoption.test.js          ← Tests funcionales (Mocha + Chai + Supertest)
├── public/
│   └── img/
├── .env.example                  ← Plantilla de variables de entorno
├── .dockerignore
├── .gitignore
├── Dockerfile
└── README.md
```

---

## Variables de entorno

Copiá `.env.example` como `.env` y completá los valores:

```bash
cp .env.example .env
```

| Variable     | Descripción                              | Ejemplo                                        |
|-------------|------------------------------------------|------------------------------------------------|
| `MONGO_URL` | Connection string de MongoDB Atlas       | `mongodb+srv://user:pass@cluster.mongodb.net/adoptme` |
| `PORT`      | Puerto del servidor                      | `8080`                                         |
| `JWT_SECRET`| Clave secreta para firmar tokens JWT     | `miClaveSecreta`                               |

---

## Endpoints disponibles

| Método | Ruta                            | Descripción                        |
|--------|----------------------------------|------------------------------------|
| GET    | `/api/adoptions`                | Obtener todas las adopciones       |
| GET    | `/api/adoptions/:aid`           | Obtener una adopción por ID        |
| POST   | `/api/adoptions/:uid/:pid`      | Crear una nueva adopción           |
| GET    | `/api/pets`                     | Obtener todas las mascotas         |
| POST   | `/api/pets`                     | Crear una mascota                  |
| PUT    | `/api/pets/:pid`                | Actualizar una mascota             |
| DELETE | `/api/pets/:pid`                | Eliminar una mascota               |
| GET    | `/api/users`                    | Obtener todos los usuarios         |
| GET    | `/api/users/:uid`               | Obtener un usuario por ID          |
| PUT    | `/api/users/:uid`               | Actualizar un usuario              |
| DELETE | `/api/users/:uid`               | Eliminar un usuario                |
| POST   | `/api/sessions/register`        | Registrar un nuevo usuario         |
| POST   | `/api/sessions/login`           | Iniciar sesión                     |
| GET    | `/api/sessions/current`         | Obtener usuario autenticado        |

---

## Documentación Swagger

Una vez levantado el servidor, accedé a:

```
http://localhost:8080/api/docs
```

---

## Correr el proyecto localmente

### Prerrequisitos
- Node.js v20+
- Una cuenta en MongoDB Atlas con cluster configurado

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

---

## Ejecutar los tests

Los tests usan `mongodb-memory-server` — **no requieren conexión a MongoDB Atlas**.

```bash
npm test
```

Resultado esperado:

```
  GET /api/adoptions — Obtener todas las adopciones
    ✔ [+] Debe retornar status 200 con payload de array vacío si no hay adopciones
    ✔ [+] Debe retornar todas las adopciones registradas
    ✔ [+] Debe retornar múltiples adopciones cuando existen varias

  GET /api/adoptions/:aid — Obtener una adopción por ID
    ✔ [+] Debe retornar la adopción correctamente con un ID válido existente
    ✔ [-] Debe retornar 404 si la adopción no existe
    ✔ [-] Debe responder con error cuando el ID tiene formato inválido

  POST /api/adoptions/:uid/:pid — Crear una adopción
    ✔ [+] Debe crear una adopción exitosamente con usuario y mascota válidos
    ✔ [+] Debe marcar la mascota como adoptada (adopted: true) luego de la operación
    ✔ [+] Debe agregar la mascota al array pets del usuario
    ✔ [+] Debe guardar el registro de adopción en la colección de adopciones
    ✔ [-] Debe retornar 404 si el usuario no existe
    ✔ [-] Debe retornar 404 si la mascota no existe
    ✔ [-] Debe retornar 400 si la mascota ya fue adoptada previamente

  13 passing
```

---

## Docker

### Construir la imagen

```bash
docker build -t samuelolivaok/adoptme-final:1.0.0 .
```

### Ejecutar el contenedor

```bash
docker run -d \
  -p 8080:8080 \
  -e MONGO_URL="mongodb+srv://usuario:password@cluster.mongodb.net/adoptme?retryWrites=true&w=majority" \
  -e JWT_SECRET="miClaveSecreta" \
  --name adoptme \
  samuelolivaok/adoptme-final:1.0.0
```

### Ver logs del contenedor

```bash
docker logs adoptme
```

### Detener el contenedor

```bash
docker stop adoptme
```

---

## Imagen en DockerHub

```
docker pull samuelolivaok/adoptme-final:1.0.0
```

🔗 **URL pública:** https://hub.docker.com/r/samuelolivaok/adoptme-final

---

## Subir imagen a DockerHub

```bash
docker login
docker build -t samuelolivaok/adoptme-final:1.0.0 .
docker push samuelolivaok/adoptme-final:1.0.0
```
