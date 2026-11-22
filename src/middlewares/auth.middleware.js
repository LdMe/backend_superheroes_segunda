/**
 * @module middlewares/auth
 * @description Middlewares de autenticación (¿quién eres?) y autorización (¿puedes hacer esto?).
 *
 * Hay dos versiones de cada middleware, igual que con los controladores:
 * - Vistas: el usuario se guarda en la sesión (req.session.user) y los errores
 *   se responden con una redirección o una página de error.
 * - API: el usuario viene en un token JWT (cabecera Authorization) y los errores
 *   se responden en JSON.
 *
 * En los dos casos dejamos el usuario en req.user = { userId, role },
 * así los controladores no tienen que saber de dónde viene.
 */

import jwt from "jsonwebtoken";
import heroRepository from "../repositories/hero.repository.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";


// ======================= Comprobaciones comunes =======================
// Lanzan un error con status si algo no cuadra. Las usan las dos versiones.

/**
 * Comprueba que el usuario tiene el rol indicado.
 *
 * @param {{userId: number, role: string}} user - Usuario autenticado.
 * @param {string} role - Rol necesario ("admin", "user").
 * @throws {ForbiddenError} Si el usuario no tiene ese rol.
 */
const checkRole = (user, role) => {
    if (user.role !== role) {
        throw new ForbiddenError(`Necesitas el rol ${role} para hacer esto`);
    }
}

/**
 * Comprueba que el usuario es el creador del héroe o es admin.
 *
 * @async
 * @param {{userId: number, role: string}} user - Usuario autenticado.
 * @param {number|string} heroId - ID del héroe.
 * @throws {NotFoundError} Si el héroe no existe.
 * @throws {ForbiddenError} Si el héroe no es suyo y no es admin.
 */
const checkHeroOwner = async (user, heroId) => {
    const hero = await heroRepository.getById(heroId);
    if (hero.userId !== user.userId && user.role !== "admin") {
        throw new ForbiddenError("Solo el creador del héroe o un admin pueden modificarlo");
    }
}


// ======================= VISTAS (sesión) =======================

/**
 * Deja pasar solo si hay un usuario con sesión iniciada.
 * Si no, lo manda al login.
 */
const isAuthenticated = (req, res, next) => {

    if (req.session.user) {
        req.user = req.session.user; // mismo nombre que en la API
        return next();
    }

    res.redirect("/auth/login");

}

/**
 * Crea un middleware que deja pasar solo a los usuarios con un rol.
 * Se usa siempre DESPUÉS de isAuthenticated (necesita req.user).
 *
 * @param {string} role - Rol necesario.
 * @returns {Function} Middleware de Express.
 *
 * @example
 * router.get("/new", isAuthenticated, hasRole("admin"), powerViewController.createForm);
 */
const hasRole = (role) => {
    return (req, res, next) => {
        try {
            checkRole(req.user, role);
            next();
        } catch (error) {
            res.status(error.status || 500).render("error", { status: error.status, message: error.message });
        }
    }
}

/**
 * Deja pasar solo al creador del héroe (req.params.id) o a un admin.
 * Se usa siempre DESPUÉS de isAuthenticated.
 */
const isHeroOwner = async (req, res, next) => {
    try {
        await checkHeroOwner(req.user, req.params.id);
        next();
    } catch (error) {
        res.status(error.status || 500).render("error", { status: error.status, message: error.message });
    }
}


// ======================= API (JWT) =======================

/**
 * Deja pasar solo si la petición trae un token válido en la cabecera
 * Authorization: Bearer <token>
 */
const isAuthenticatedApi = (req, res, next) => {
    try {
        const authorization = req.headers.authorization; // "Bearer eyJhbGciOi..."
        if (!authorization || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedError("Falta el token de autenticación");
        }
        const token = authorization.split(" ")[1];
        let payload;
        try {
            // comprueba la firma y la caducidad; si algo falla, lanza un error
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new UnauthorizedError("Token inválido o caducado");
        }
        req.user = { userId: payload.userId, role: payload.role };
        next();
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}

/**
 * Versión API de hasRole. Se usa DESPUÉS de isAuthenticatedApi.
 *
 * @param {string} role - Rol necesario.
 * @returns {Function} Middleware de Express.
 *
 * @example
 * router.post("/", isAuthenticatedApi, hasRoleApi("admin"), powerApiController.create);
 */
const hasRoleApi = (role) => {
    return (req, res, next) => {
        try {
            checkRole(req.user, role);
            next();
        } catch (error) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }
}

/**
 * Versión API de isHeroOwner. Se usa DESPUÉS de isAuthenticatedApi.
 */
const isHeroOwnerApi = async (req, res, next) => {
    try {
        await checkHeroOwner(req.user, req.params.id);
        next();
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}


export {
    isAuthenticated,
    hasRole,
    isHeroOwner,
    isAuthenticatedApi,
    hasRoleApi,
    isHeroOwnerApi
}
