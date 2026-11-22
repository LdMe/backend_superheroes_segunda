/**
 * @module middlewares/error
 * @description Últimos middlewares de la aplicación: la "red de seguridad".
 *
 * Los controladores ya capturan sus errores con try/catch. Estos middlewares
 * solo actúan con lo que se escapa:
 * - notFound / notFoundApi: ninguna ruta ha respondido -> 404
 * - errorHandler: algún middleware o controlador ha lanzado un error sin capturarlo -> 500
 *
 * Sin ellos, Express respondería con su página por defecto ("Cannot GET /xxx",
 * o el stack trace del error), que no es JSON ni usa nuestras vistas.
 */

import { NotFoundError } from "../utils/errors.js";


// ======================= VISTAS =======================

/**
 * Se monta al final del router de vistas: si llegamos aquí, no existe la página.
 */
const notFound = (req, res) => {
    const error = new NotFoundError(`La página ${req.originalUrl} no existe`);
    res.status(error.status).render("error", { status: error.status, message: error.message });
}


// ======================= API =======================

/**
 * Se monta al final del router de la API: si llegamos aquí, no existe el endpoint.
 */
const notFoundApi = (req, res) => {
    const error = new NotFoundError(`El endpoint ${req.method} ${req.originalUrl} no existe`);
    res.status(error.status).json({ error: error.message });
}


// ======================= Errores sin capturar =======================

/**
 * Manejador de errores de Express. Lo reconoce porque recibe 4 parámetros
 * (el primero es el error). Se monta en index.js, después de todas las rutas.
 */
const errorHandler = (error, req, res, next) => {
    console.error(error);
    const status = error.status || 500;
    // no enseñamos los detalles de un error inesperado: pueden revelar cómo está hecha la app
    const message = error.status ? error.message : "Ha ocurrido un error inesperado";
    if (req.originalUrl.startsWith("/api")) {
        return res.status(status).json({ error: message });
    }
    res.status(status).render("error", { status, message });
}


export {
    notFound,
    notFoundApi,
    errorHandler
}
