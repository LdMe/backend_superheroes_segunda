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
 * Obtener la lista de todos los héroes, con su creador y sus poderes.
 *
 * @async
 * @returns {Promise<Array<Object>>} Promesa que resuelve con un array de héroes.
 */
const getAll = async () => {
    try {
        const heroes = await Hero.findAll({
            include: HERO_INCLUDE,
            order: [["heroId", "ASC"]]
        });
        return heroes;
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
