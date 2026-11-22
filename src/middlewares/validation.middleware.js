/**
 * @module middlewares/validation
 * @description Middlewares para validar los parámetros de la URL antes de llegar al controlador.
 *
 * Se usan con router.param, que ejecuta el middleware cada vez que una ruta
 * del router tiene ese parámetro (":id", ":powerId"...). Así no hay que
 * añadirlo a mano en todas las rutas:
 *
 *   router.param("id", isValidId);
 *
 * Igual que con auth.middleware.js, hay una versión para vistas y otra para la API.
 */

// checkId está en utils porque también lo usa el filtro ?power= del listado de héroes
import { checkId } from "../utils/query.js";


// ======================= VISTAS =======================

/**
 * Middleware para router.param en las vistas.
 * Recibe, además de req, res y next, el valor del parámetro.
 */
const isValidId = (req, res, next, value) => {
    try {
        checkId(value);
        next();
    } catch (error) {
        res.status(error.status || 500).render("error", { status: error.status, message: error.message });
    }
}


// ======================= API =======================

/**
 * Middleware para router.param en la API.
 */
const isValidIdApi = (req, res, next, value) => {
    try {
        checkId(value);
        next();
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}


export {
    isValidId,
    isValidIdApi
}
