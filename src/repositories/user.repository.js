/**
 * @module respository/user
 * @description Repositorio para la gestión de usuarios en la base de datos.
 */

import { User, Hero } from "../models/index.js";
import { NotFoundError, throwError } from "../utils/errors.js";


// Nunca devolvemos la contraseña al leer usuarios
const PUBLIC_ATTRIBUTES = { exclude: ["password"] };

/**
 * Quita la contraseña de un usuario recién creado o modificado.
 * (create y save devuelven el objeto completo, con la contraseña)
 * 
 * @param {Object} user - Instancia del modelo User devuelta por Sequelize.
 * @returns {Object} Objeto del usuario sin el campo password.
 */
const withoutPassword = (user) => {
    const { password, ...rest } = user.toJSON();
    return rest;
}


// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)
/**
 * @typedef {Object} UserData
 * @property {string} username - Nombre del usuario
 * @property {string} email - email del usuario
 * @property {string} password - contraseña
 * @property {string} role - rol: "user" o "admin"
 */

/**
 * Crear un nuevo usuario.
 * 
 * @async
 * @param {UserData} data - Datos del usuario a crear.
 * @returns {Promise<Object>} Promesa que resuelve con el usuario creado (sin contraseña).
 * @throws {Error} Lanza excepción si ocurre un error al crear usuario (ya existe con email o username o fallo de conexión).
 * 
 * @example     
 * await create({ username: 'Yisus', email: 'yisus@krais.com', password: '1234', role: 'admin' });
 */
const create = async (data) => {
    const { username, email, password, role } = data;
    try {
        // const password_hash = await bcrypt.hash(password,10);
        // const user = await User.create({ username, email, password:password_hash, role });
        const user = await User.create({ username, email, password, role });
        return withoutPassword(user);
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}


// ------------------ R (Read)---------------------------------------------
/**
 * Obtener la lista de todos los usuarios.
 * 
 * @async
 * @returns {Promise<Array<Object>>} Promesa que resuelve con un array de usuarios (sin contraseña).
 */
const getAll = async () => {
    try {
        const users = await User.findAll({
            attributes: PUBLIC_ATTRIBUTES,
            order: [["userId", "ASC"]]
        });
        return users;
    } catch (error) {
        throwError(error);
    }
};

/**
 * Obtener un usuario individual por su ID, junto con sus héroes.
 * 
 * @async
 * @param {number|string} id - ID del usuario.
 * @returns {Promise<Object|null>} Promesa que resuelve con el usuario encontrado o null si no existe.
 */
const getById = async (id) => {
    try {
        const user = await User.findByPk(id, {
            attributes: PUBLIC_ATTRIBUTES,
            include: {
                model: Hero,
                as: "heroes",
            }
        });
        if(!user){
            throw new NotFoundError("Usuario no encontrado");
        }
        return user;
    } catch (error) {
        throwError(error);
    }
};

/**
 * Obtener un usuario individual por su email, junto con sus héroes.
 * Nota: Este método actualmente devuelve la contraseña, ya que no usa PUBLIC_ATTRIBUTES.
 * 
 * @async
 * @param {string} email - Email del usuario a buscar.
 * @returns {Promise<Object|null>} Promesa que resuelve con el usuario encontrado o null si no existe.
 */
const getByEmail = async (email) => {
    try {
        const user = await User.findOne({where: {email}}, {
            include: {
                model: Hero,
                as: "heroes",
            }
        });
        if(!user){
            throw new NotFoundError("Usuario no encontrado");
        }
        return user;
    } catch (error) {
        throwError(error);
    }
};

/**
 * Obtener un usuario individual por su nombre de usuario, junto con sus héroes.
 * 
 * @async
 * @param {string} username - Nombre de usuario a buscar.
 * @returns {Promise<Object|null>} Promesa que resuelve con el usuario encontrado o null si no existe.
 */
const getByUsername = async (username) => {
    try {
        const user = await User.findOne({where: {username}}, {
            attributes: PUBLIC_ATTRIBUTES,
            include: {
                model: Hero,
                as: "heroes",
            }
        });
        if(!user){
            throw new NotFoundError("Usuario no encontrado");
        }
        return user;
        
    } catch (error) {
        console.error(error);
        throwError(error);
    }
};


// ---------------- U (Update) -----------------------------------
/**
 * Reemplazar un usuario por completo.
 * 
 * @async
 * @param {number|string} id - ID del usuario a modificar.
 * @param {UserData} data - Nuevos datos completos del usuario.
 * @returns {Promise<Object|null>} Promesa que resuelve con el usuario actualizado (sin contraseña) o null si no se encuentra.
 */
const update = async (id, data) => {
    try {
        const { username, email, password, role } = data;
        const user = await User.findByPk(id);
        if (user) {
            user.username = username;
            user.email = email;
            user.password = password;
            user.role = role;
            await user.save();
            return withoutPassword(user);
        } else {
            throw new NotFoundError("El usuario no existe");
        }
    }catch(error){
        console.error(error);
        throwError(error);
    }

}

/**
 * Cambiar solo los campos proporcionados de un usuario.
 * La contraseña solo se cambia si llega una nueva (no vacía).
 * 
 * @async
 * @param {number|string} id - ID del usuario a modificar.
 * @param {Partial<UserData>} data - Datos parciales del usuario a actualizar.
 * @returns {Promise<Object|null>} Promesa que resuelve con el usuario modificado (sin contraseña) o null si no se encuentra.
 */
const modify = async (id, data) => {
    try {
        
        const { username, email, password, role } = data;
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFoundError("El usuario no existe");
        }
        user.username = username ?? user.username;
        user.email = email ?? user.email;
        user.password = password || user.password;
        user.role = role ?? user.role;
        await user.save();
        return withoutPassword(user);
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}


// ------------------------ D (Delete)------------

/**
 * Eliminar un usuario por su ID.
 * 
 * @async
 * @param {number|string} id - ID del usuario a eliminar.
 * @returns {Promise<Object|null>} Promesa que resuelve con el usuario eliminado (sin contraseña) o null si no se encuentra.
 */
const remove = async (id) => {
    try {
        
        const user = await User.findByPk(id);
        if (user) {
            await user.destroy();
            return withoutPassword(user);
        }
        throw new NotFoundError("El usuario no existe");
    } catch (error) {
        console.error(error);
        throwError(error);
    }
}


export default {
    create,
    getAll,
    getById,
    getByEmail,
    getByUsername,
    update,
    modify,
    remove
}
