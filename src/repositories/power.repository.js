
import { Power, Hero } from "../models/index.js";


// ------------------ CRUD de power ----------------------------

// ------------------ C (Create)
// crear un poder
const create = async (data) => {
    const { name, description, utility_level } = data;
    const power = await Power.create({ name, description, utility_level });
    return power;
}


// ------------------ R (Read)---------------------------------------------
// lista de poderes
const getAll = async () => {
    const powers = await Power.findAll({
        order: [["name", "ASC"]]
    });
    return powers;
};

// poder individual, con los héroes que lo tienen
const getById = async (id) => {
    const power = await Power.findByPk(id, {
        include: [
            {
                model: Hero,
                as: "heroes"
            }
        ]
    });
    return power;
};


// ---------------- U (Update) -----------------------------------
// cambiar el poder por completo
const update = async (id, data) => {
    const { name, description, utility_level } = data;
    const power = await Power.findByPk(id);
    if (power) {
        power.name = name;
        power.description = description;
        power.utility_level = utility_level;
        await power.save();
        return power;
    } else {
        return null;
    }

}

// cambiar solo los campos que nos llegan
const modify = async (id, data) => {
    const { name, description, utility_level } = data;
    const power = await Power.findByPk(id);
    if (!power) {
        return null;
    }
    power.name = name ?? power.name;
    power.description = description ?? power.description;
    power.utility_level = utility_level ?? power.utility_level;
    await power.save();
    return power;
}


// ------------------------ D (Delete)------------

const remove = async (id) => {
    const power = await Power.findByPk(id);
    if (power) {
        await power.destroy();
        return power;
    }
    return null;
}


export default {
    create,
    getAll,
    getById,
    update,
    modify,
    remove
}
