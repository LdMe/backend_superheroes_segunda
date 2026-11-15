
import { Hero, User, Power } from "../models/index.js";


// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)
// crear un héroe
const create = async (data) => {
    const { name, description, userId } = data;
    const hero = await Hero.create({ name, description, userId });
    return hero;
}


// ------------------ R (Read)---------------------------------------------
// lista de héroes
// Incluimos los poderes porque los necesita el campo virtual utility_level
const getAll = async () => {
    const heroes = await Hero.findAll({
        include: [
            {
                model: User,
                as: "owner",
                attributes: ["userId", "username"]
            },
            {
                model: Power,
                as: "powers"
            }
        ],
        order: [["heroId", "ASC"]]
    });
    return heroes;
};

// héroe individual, con su creador y sus poderes
const getById = async (id) => {
    const hero = await Hero.findByPk(id, {
        include: [
            {
                model: User,
                as: "owner",
                attributes: ["userId", "username", "email"]
            },
            {
                model: Power,
                as: "powers"
            }
        ]
    });
    return hero;
};


// ---------------- U (Update) -----------------------------------
// cambiar el héroe por completo
const update = async (id, data) => {
    const { name, description, userId } = data;
    const hero = await Hero.findByPk(id);
    if (hero) {
        hero.name = name;
        hero.description = description;
        hero.userId = userId;
        await hero.save();
        return hero;
    } else {
        return null;
    }

}

// cambiar solo los campos que nos llegan
// usamos ?? en vez de || para poder guardar valores como "" (descripción vacía)
const modify = async (id, data) => {
    const { name, description, userId } = data;
    const hero = await Hero.findByPk(id);
    if (!hero) {
        return null;
    }
    hero.name = name ?? hero.name;
    hero.description = description ?? hero.description;
    hero.userId = userId ?? hero.userId;
    await hero.save();
    return hero;
}


// ------------------------ D (Delete)------------

const remove = async (id) => {
    const hero = await Hero.findByPk(id);
    if (hero) {
        await hero.destroy();
        return hero;
    }
    return null;
}


// ------------------------ Poderes del héroe (relación N:M) ------------
// Al definir Hero.belongsToMany(Power, { as: "powers" }) Sequelize añade
// a cada héroe los métodos addPower, removePower, getPowers, setPowers...

const addPower = async (heroId, powerId) => {
    const hero = await Hero.findByPk(heroId);
    const power = await Power.findByPk(powerId);
    if (!hero || !power) {
        return null;
    }
    await hero.addPower(power); // inserta una fila en hero_powers
    return hero;
}

const removePower = async (heroId, powerId) => {
    const hero = await Hero.findByPk(heroId);
    const power = await Power.findByPk(powerId);
    if (!hero || !power) {
        return null;
    }
    await hero.removePower(power); // borra la fila de hero_powers
    return hero;
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
