
import heroRepository from "../../repositories/hero.repository.js";
import userRepository from "../../repositories/user.repository.js";
import powerRepository from "../../repositories/power.repository.js";
import { getErrorMessage } from "../../utils/errors.js";


// poderes que se le pueden asignar al héroe: todos menos los que ya tiene
const getAvailablePowers = async (hero) => {
    const allPowers = await powerRepository.getAll();
    const heroPowerIds = hero.powers.map(power => power.powerId);
    return allPowers.filter(power => !heroPowerIds.includes(power.powerId));
}


// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)

// vista del formulario de creación
// necesita la lista de usuarios para elegir el creador del héroe
// (cuando tengamos login, el creador saldrá del usuario autenticado)
const createForm = async (req, res) => {
    const users = await userRepository.getAll();
    res.render("hero/create", { users, hero: {}, error: null });
}

// crear el héroe
const create = async (req, res) => {
    try {
        const hero = await heroRepository.create(req.body);
        res.redirect("/hero/" + hero.heroId);
    } catch (error) {
        console.error(error);
        // volvemos a mostrar el formulario con los datos que había escrito
        const users = await userRepository.getAll();
        res.render("hero/create", { users, hero: req.body, error: getErrorMessage(error) });
    }
}


// ------------------ R (Read)---------------------------------------------
// lista de héroes
const getAll = async (req, res) => {
    const heroes = await heroRepository.getAll();
    res.render("hero/list", { heroes });
};

// ficha del héroe
// además del héroe, cargamos todos los poderes para poder asignarle uno
const getById = async (req, res) => {
    const id = parseInt(req.params.id);
    const hero = await heroRepository.getById(id);
    if (!hero) {
        return res.status(404).render("hero/show", { hero: null });
    }
    const availablePowers = await getAvailablePowers(hero);
    res.render("hero/show", { hero, availablePowers, newPower: {}, error: null });
};


// ---------------- U (Update) -----------------------------------

// vista del formulario de edición
const updateForm = async (req, res) => {
    const id = parseInt(req.params.id);
    const hero = await heroRepository.getById(id);
    if (!hero) {
        return res.redirect("/hero");
    }
    const users = await userRepository.getAll();
    res.render("hero/edit", { hero, users, error: null });
}

// cambiar el héroe por completo
const update = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const hero = await heroRepository.update(id, req.body);
        if (hero) {
            res.redirect("/hero/" + hero.heroId);
        } else {
            res.redirect("/hero");
        }
    } catch (error) {
        console.error(error);
        const users = await userRepository.getAll();
        res.render("hero/edit", { hero: { ...req.body, heroId: id }, users, error: getErrorMessage(error) });
    }
}


// ------------------------ D (Delete)------------

const remove = async (req, res) => {
    const id = parseInt(req.params.id);
    await heroRepository.remove(id);
    res.redirect("/hero");
}


// ------------------------ Poderes del héroe ------------

// asignar un poder que ya existe
const addPower = async (req, res) => {
    const id = parseInt(req.params.id);
    const powerId = parseInt(req.body.powerId);
    await heroRepository.addPower(id, powerId);
    res.redirect("/hero/" + id);
}

// crear un poder nuevo y asignárselo al héroe en el mismo paso
// el controlador usa dos repositorios: primero crea el poder y luego lo asigna
const createPower = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const power = await powerRepository.create(req.body);
        await heroRepository.addPower(id, power.powerId);
        res.redirect("/hero/" + id);
    } catch (error) {
        console.error(error);
        const hero = await heroRepository.getById(id);
        const availablePowers = await getAvailablePowers(hero);
        res.render("hero/show", { hero, availablePowers, newPower: req.body, error: getErrorMessage(error) });
    }
}

// quitar un poder al héroe (el poder sigue existiendo)
const removePower = async (req, res) => {
    const id = parseInt(req.params.id);
    const powerId = parseInt(req.params.powerId);
    await heroRepository.removePower(id, powerId);
    res.redirect("/hero/" + id);
}


export default {
    create,
    getAll,
    getById,
    update,
    createForm,
    updateForm,
    remove,
    addPower,
    createPower,
    removePower
}
