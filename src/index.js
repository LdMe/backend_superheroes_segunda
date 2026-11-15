import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/router.js";
import connection from "./config/db.js";

dotenv.config();

// dentro del contenedor la app escucha en el 3000 (docker-compose lo publica en APP_PORT)
const PORT = process.env.PORT || 3000;

const app = express();

// Middlewares 
app.use(cors())
app.use(express.json()) // permite leer el body de los POST en json
app.use(express.urlencoded({ extended: true })) // permite leer el body de los POST en formularios

app.use(express.static("public"));

app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use("/", router);

async function startServer() {
    const maxAttempts = 5;
    let attempts = maxAttempts;
    while (attempts) {
        try {
            await connection.authenticate();
            console.log("Conexión establecida con la base de datos");
            app.listen(PORT, () => {
                console.log(`Aplicación en marcha en el puerto ${PORT}`)
            })
            break;
        } catch (error) {
            console.error(`Intento ${maxAttempts - attempts + 1}: no se ha podido conectar a la base de datos`, error.message);
        }
        attempts--;
        if (attempts > 0) {
            // esperamos 5 segundos antes de volver a intentarlo (la BD puede estar arrancando)
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
    if(attempts === 0){
        console.error(`no se ha podido conectar a la base de datos en ${maxAttempts} intentos`);
        process.exit(1);
    }

}


startServer();


