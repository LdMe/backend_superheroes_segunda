
import { User, Hero } from "../models/index.js";

// Nunca devolvemos la contraseña al leer usuarios
const PUBLIC_ATTRIBUTES = { exclude: ["password"] };

// Quita la contraseña de un usuario recién creado o modificado
// (create y save devuelven el objeto completo, con la contraseña)
const withoutPassword = (user) => {
    const { password, ...rest } = user.toJSON();
    return rest;
}


// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)
// crear un usuario
const create = async (data) => {
    const { username, email, password, role } = data;
    // const password_hash = await bcrypt.hash(password,10);
    // const user = await User.create({ username, email, password:password_hash, role });
    const user = await User.create({ username, email, password, role });
    return withoutPassword(user);
}


// ------------------ R (Read)---------------------------------------------
// lista de usuarios
const getAll = async () => {
    const users = await User.findAll({
        attributes: PUBLIC_ATTRIBUTES,
        order: [["userId", "ASC"]]
    });
    return users;
};

// usuario individual, con sus héroes
const getById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: PUBLIC_ATTRIBUTES,
        include: {
            model: Hero,
            as: "heroes",
        }
    });
    return user;
};

const getByEmail = async (email) => {
    const user = await User.findOne({where: {email}}, {
        include: {
            model: Hero,
            as: "heroes",
        }
    });
    return user;
};

const getByUsername = async (username) => {
    const user = await User.findOne({where: {username}}, {
        attributes: PUBLIC_ATTRIBUTES,
        include: {
            model: Hero,
            as: "heroes",
        }
    });
    return user;
};


// ---------------- U (Update) -----------------------------------
// cambiar el usuario por completo
const update = async (id, data) => {
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
        return null;
    }

}

// cambiar solo los campos que nos llegan
// la contraseña solo se cambia si nos llega una nueva (no vacía)
const modify = async (id, data) => {
    const { username, email, password, role } = data;
    const user = await User.findByPk(id);
    if (!user) {
        return null;
    }
    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.password = password || user.password;
    user.role = role ?? user.role;
    await user.save();
    return withoutPassword(user);
}


// ------------------------ D (Delete)------------

const remove = async (id) => {
    const user = await User.findByPk(id);
    if (user) {
        await user.destroy();
        return withoutPassword(user);
    }
    return null;
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
