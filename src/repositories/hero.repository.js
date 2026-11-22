/**
 * @module repository/hero
 * @description Repositorio para la gestión de héroes y de sus poderes (relación N:M).
 */

import { Hero, User, Power } from "../models/index.js";
import { NotFoundError, throwError } from "../utils/errors.js";


// Al leer un héroe siempre cargamos su creador y sus poderes:
// los poderes los necesita el campo virtual utility_level (la media).
const HERO_INCLUDE = [
    {
        model: User,
        as: "owner",
        attributes: ["userId", "username"]
    },
    {
        model: Power,
        as: "powers"
    }
];


// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)
/**
 * @typedef {Object} HeroData
 * @property {string} name - Nombre del héroe (único)
 * @property {string} [description] - Descripción
 * @property {number} userId - Id del usuario que lo crea
 */

/**
 * Crear un nuevo héroe.
 *
 * @async
 * @param {HeroData} data - Datos del héroe. El userId lo pone el controlador a partir del usuario autenticado.
 * @returns {Promise<Object>} Promesa que resuelve con el héroe creado.
 * @throws {UniqueNameError} Si ya existe un héroe con ese nombre.
 *
 * @example
 * await create({ name: 'La Desatascadora', description: 'Ningún fregadero se le resiste', userId: 2 });
 */
const create = async (data) => {
    const { name, description, userId } = data;
    try {
        const hero = await Hero.create({ name, description, userId });
        return hero;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}


// ------------------ R (Read)---------------------------------------------
/**
 * @typedef {Object} Pagination
 * @property {number} page - Página actual (empieza en 1).
 * @property {number} limit - Héroes por página.
 * @property {number} total - Total de héroes (con el filtro aplicado).
 * @property {number} totalPages - Número de páginas.
 */

/**
 * Obtener una página de héroes, con su creador y sus poderes.
 * Opcionalmente, solo los héroes que tienen un poder concreto.
 *
 * @async
 * @param {Object} [options]
 * @param {number|null} [options.powerId] - Si se indica, solo héroes con este poder.
 * @param {number} [options.page=1] - Página que se pide.
 * @param {number} [options.limit=6] - Héroes por página.
 * @returns {Promise<{heroes: Array<Object>, pagination: Pagination}>}
 * @throws {NotFoundError} Si se filtra por un poder que no existe.
 *
 * @example
 * await getAll();                                  // primera página, todos los héroes
 * await getAll({ powerId: 3, page: 1, limit: 6 }); // héroes con el poder 3
 */
const getAll = async ({ powerId = null, page = 1, limit = 6 } = {}) => {
    try {
        const where = {};
        if (powerId) {
            // Filtrar con un "where" dentro del include de poderes no sirve: solo
            // cargaría ESE poder de cada héroe y la media de utilidad saldría mal.
            // Por eso primero buscamos qué héroes tienen el poder...
            const power = await Power.findByPk(powerId, {
                include: { model: Hero, as: "heroes", attributes: ["heroId"] }
            });
            if (!power) {
                throw new NotFoundError("Poder no encontrado");
            }
            // ...y luego pedimos esos héroes con TODOS sus poderes.
            // Un array en el where se traduce a SQL como: WHERE hero_id IN (1, 4, 9)
            where.heroId = power.heroes.map(hero => hero.heroId);
        }

        // findAndCountAll devuelve los registros de la página (rows) y el total (count)
        const { count, rows } = await Hero.findAndCountAll({
            where,
            include: HERO_INCLUDE,
            order: [["heroId", "ASC"]],
            limit,                      // cuántos héroes como máximo
            offset: (page - 1) * limit, // cuántos nos saltamos: página 2 con limit 6 -> saltamos 6
            distinct: true              // contar héroes, no filas del JOIN con los poderes
        });

        return {
            heroes: rows,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        };
    } catch (error) {
        console.error(error);
        throwError(error);
    }
};

/**
 * Obtener un héroe por su ID, con su creador y sus poderes.
 *
 * @async
 * @param {number|string} id - ID del héroe.
 * @returns {Promise<Object>} Promesa que resuelve con el héroe encontrado.
 * @throws {NotFoundError} Si el héroe no existe.
 */
const getById = async (id) => {
    try {
        const hero = await Hero.findByPk(id, {
            include: HERO_INCLUDE
        });
        if (!hero) {
            throw new NotFoundError("Héroe no encontrado");
        }
        return hero;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
};


// ---------------- U (Update) -----------------------------------
// El creador (userId) no se cambia nunca al editar: el héroe es de quien lo creó.

/**
 * Reemplazar un héroe por completo (nombre y descripción).
 *
 * @async
 * @param {number|string} id - ID del héroe.
 * @param {HeroData} data - Nuevos datos del héroe.
 * @returns {Promise<Object>} Promesa que resuelve con el héroe actualizado.
 * @throws {NotFoundError} Si el héroe no existe.
 */
const update = async (id, data) => {
    try {
        const { name, description } = data;
        const hero = await Hero.findByPk(id);
        if (!hero) {
            throw new NotFoundError("Héroe no encontrado");
        }
        hero.name = name;
        hero.description = description;
        await hero.save();
        return hero;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}

/**
 * Cambiar solo los campos que llegan.
 * Usamos ?? en vez de || para poder guardar valores como "" (descripción vacía).
 *
 * @async
 * @param {number|string} id - ID del héroe.
 * @param {Partial<HeroData>} data - Datos parciales del héroe.
 * @returns {Promise<Object>} Promesa que resuelve con el héroe modificado.
 * @throws {NotFoundError} Si el héroe no existe.
 */
const modify = async (id, data) => {
    try {
        const { name, description } = data;
        const hero = await Hero.findByPk(id);
        if (!hero) {
            throw new NotFoundError("Héroe no encontrado");
        }
        hero.name = name ?? hero.name;
        hero.description = description ?? hero.description;
        await hero.save();
        return hero;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}


// ------------------------ D (Delete)------------

/**
 * Eliminar un héroe. Sus filas de hero_powers se borran solas (ON DELETE CASCADE).
 *
 * @async
 * @param {number|string} id - ID del héroe.
 * @returns {Promise<Object>} Promesa que resuelve con el héroe eliminado.
 * @throws {NotFoundError} Si el héroe no existe.
 */
const remove = async (id) => {
    try {
        const hero = await Hero.findByPk(id);
        if (!hero) {
            throw new NotFoundError("Héroe no encontrado");
        }
        await hero.destroy();
        return hero;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}


// ------------------------ Poderes del héroe (relación N:M) ------------
// Al definir Hero.belongsToMany(Power, { as: "powers" }) Sequelize añade
// a cada héroe los métodos addPower, removePower, getPowers, setPowers...

/**
 * Asignar un poder existente a un héroe. Si ya lo tenía, no se duplica.
 *
 * @async
 * @param {number|string} heroId - ID del héroe.
 * @param {number|string} powerId - ID del poder.
 * @returns {Promise<Object>} Promesa que resuelve con el héroe.
 * @throws {NotFoundError} Si el héroe o el poder no existen.
 */
const addPower = async (heroId, powerId) => {
    try {
        const hero = await Hero.findByPk(heroId);
        if (!hero) {
            throw new NotFoundError("Héroe no encontrado");
        }
        const power = await Power.findByPk(powerId);
        if (!power) {
            throw new NotFoundError("Poder no encontrado");
        }
        await hero.addPower(power); // inserta una fila en hero_powers
        return hero;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}

/**
 * Quitar un poder a un héroe. El poder sigue existiendo en el catálogo.
 *
 * @async
 * @param {number|string} heroId - ID del héroe.
 * @param {number|string} powerId - ID del poder.
 * @returns {Promise<Object>} Promesa que resuelve con el héroe.
 * @throws {NotFoundError} Si el héroe o el poder no existen.
 */
const removePower = async (heroId, powerId) => {
    try {
        const hero = await Hero.findByPk(heroId);
        if (!hero) {
            throw new NotFoundError("Héroe no encontrado");
        }
        const power = await Power.findByPk(powerId);
        if (!power) {
            throw new NotFoundError("Poder no encontrado");
        }
        await hero.removePower(power); // borra la fila de hero_powers
        return hero;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}


export default {
    create,
    getAll,
    getById,
    update,
    modify,
    remove,
    addPower,
    removePower
}
