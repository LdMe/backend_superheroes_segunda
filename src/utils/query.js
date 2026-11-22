/**
 * @module utils/query
 * @description Funciones para validar y leer datos que llegan en la URL
 * (parámetros como :id o la query string ?power=3&page=2).
 */

import { ValidationError } from "./errors.js";

// héroes por página si no se indica ?limit=
// (con los 10 héroes del seed, 6 por página hace que se vea la paginación)
const DEFAULT_LIMIT = 6;
// máximo que dejamos pedir, para que nadie pida ?limit=1000000
const MAX_LIMIT = 50;


/**
 * Comprueba que un valor es un id válido: un número entero positivo.
 * "12" vale; "abc", "12abc", "-3" o "1.5" no.
 *
 * @param {string} value - Valor que llega en la URL.
 * @returns {number} El id convertido a número.
 * @throws {ValidationError} Si no es un id válido.
 */
const checkId = (value) => {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError(`"${value}" no es un id válido`);
    }
    return id;
}

/**
 * Convierte un valor de la query en un entero positivo.
 * Si no llega o no es válido, devuelve el valor por defecto.
 *
 * @param {string} value - Valor de la query (siempre llega como texto).
 * @param {number} defaultValue - Valor si no llega o no es válido.
 * @returns {number}
 */
const toPositiveInt = (value, defaultValue) => {
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 ? number : defaultValue;
}


/**
 * @typedef {Object} HeroListOptions
 * @property {number|null} powerId - Filtrar por los héroes que tienen este poder (null = todos).
 * @property {number} page - Página que se pide (empieza en 1).
 * @property {number} limit - Héroes por página.
 */

/**
 * Lee los filtros y la paginación del listado de héroes desde req.query.
 *
 * @param {Object} query - req.query, por ejemplo { power: "3", page: "2", limit: "5" }.
 * @returns {HeroListOptions}
 * @throws {ValidationError} Si ?power= no es un id válido.
 *
 * @example
 * getHeroListOptions({ power: "3", page: "2" }); // { powerId: 3, page: 2, limit: 6 }
 * getHeroListOptions({});                        // { powerId: null, page: 1, limit: 6 }
 */
const getHeroListOptions = (query) => {
    // un filtro mal escrito es un error (400): no queremos devolver "todos" sin avisar
    const powerId = query.power ? checkId(query.power) : null;
    // una página mal escrita, en cambio, simplemente vuelve a la primera
    const page = toPositiveInt(query.page, 1);
    const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    return { powerId, page, limit };
}


export {
    checkId,
    getHeroListOptions,
    DEFAULT_LIMIT
}
