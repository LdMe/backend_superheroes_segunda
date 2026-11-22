/**
 * @module repository/power
 * @description Repositorio para la gestión del catálogo de poderes.
 */

import { Power, Hero } from "../models/index.js";
import { NotFoundError, throwError } from "../utils/errors.js";


// ------------------ CRUD de power ----------------------------

// ------------------ C (Create)
/**
 * @typedef {Object} PowerData
 * @property {string} name - Nombre del poder (único)
 * @property {string} [description] - Descripción
 * @property {number} utility_level - Nivel de utilidad, de 1 a 10
 */

/**
 * Crear un nuevo poder.
 *
 * @async
 * @param {PowerData} data - Datos del poder.
 * @returns {Promise<Object>} Promesa que resuelve con el poder creado.
 * @throws {UniqueNameError} Si ya existe un poder con ese nombre.
 * @throws {ValidationError} Si el nivel de utilidad no está entre 1 y 10.
 *
 * @example
 * await create({ name: 'Plegar sábanas bajeras', description: 'A la primera', utility_level: 9 });
 */
const create = async (data) => {
    const { name, description, utility_level } = data;
    try {
        const power = await Power.create({ name, description, utility_level });
        return power;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}


// ------------------ R (Read)---------------------------------------------
/**
 * Obtener la lista de todos los poderes, ordenados por nombre.
 *
 * @async
 * @returns {Promise<Array<Object>>} Promesa que resuelve con un array de poderes.
 */
const getAll = async () => {
    try {
        const powers = await Power.findAll({
            order: [["name", "ASC"]]
        });
        return powers;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
};

/**
 * Obtener un poder por su ID, con los héroes que lo tienen.
 *
 * @async
 * @param {number|string} id - ID del poder.
 * @returns {Promise<Object>} Promesa que resuelve con el poder encontrado.
 * @throws {NotFoundError} Si el poder no existe.
 */
const getById = async (id) => {
    try {
        const power = await Power.findByPk(id, {
            include: [
                {
                    model: Hero,
                    as: "heroes"
                }
            ]
        });
        if (!power) {
            throw new NotFoundError("Poder no encontrado");
        }
        return power;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
};


// ---------------- U (Update) -----------------------------------
/**
 * Reemplazar un poder por completo.
 *
 * @async
 * @param {number|string} id - ID del poder.
 * @param {PowerData} data - Nuevos datos del poder.
 * @returns {Promise<Object>} Promesa que resuelve con el poder actualizado.
 * @throws {NotFoundError} Si el poder no existe.
 */
const update = async (id, data) => {
    try {
        const { name, description, utility_level } = data;
        const power = await Power.findByPk(id);
        if (!power) {
            throw new NotFoundError("Poder no encontrado");
        }
        power.name = name;
        power.description = description;
        power.utility_level = utility_level;
        await power.save();
        return power;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}

/**
 * Cambiar solo los campos que llegan.
 *
 * @async
 * @param {number|string} id - ID del poder.
 * @param {Partial<PowerData>} data - Datos parciales del poder.
 * @returns {Promise<Object>} Promesa que resuelve con el poder modificado.
 * @throws {NotFoundError} Si el poder no existe.
 */
const modify = async (id, data) => {
    try {
        const { name, description, utility_level } = data;
        const power = await Power.findByPk(id);
        if (!power) {
            throw new NotFoundError("Poder no encontrado");
        }
        power.name = name ?? power.name;
        power.description = description ?? power.description;
        power.utility_level = utility_level ?? power.utility_level;
        await power.save();
        return power;
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}


// ------------------------ D (Delete)------------

/**
 * Eliminar un poder. Se quita de todos los héroes que lo tenían (ON DELETE CASCADE).
 *
 * @async
 * @param {number|string} id - ID del poder.
 * @returns {Promise<Object>} Promesa que resuelve con el poder eliminado.
 * @throws {NotFoundError} Si el poder no existe.
 */
const remove = async (id) => {
    try {
        const power = await Power.findByPk(id);
        if (!power) {
            throw new NotFoundError("Poder no encontrado");
        }
        await power.destroy();
        return power;
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
    remove
}
