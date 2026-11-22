
import heroRepository from "../../repositories/hero.repository.js";
import powerRepository from "../../repositories/power.repository.js";

// Los permisos (estar logueado, ser el creador o admin) los comprueban
// los middlewares en hero.router.js: aquí ya sabemos que se puede hacer.


// poderes que se le pueden asignar al héroe: todos menos los que ya tiene
const getAvailablePowers = async (hero) => {
    const allPowers = await powerRepository.getAll();
    const heroPowerIds = hero.powers.map(power => power.powerId);
    return allPowers.filter(power => !heroPowerIds.includes(power.powerId));
}


// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)

// vista del formulario de creación
const createForm = (req, res) => {
    res.render("hero/create", { hero: {}, error: null });
}

// crear el héroe
// el creador es siempre el usuario logueado, nunca algo que venga del formulario
const create = async (req, res) => {
    const { name, description } = req.body;
    try {
        const hero = await heroRepository.create({ name, description, userId: req.user.userId });
        res.redirect("/hero/" + hero.heroId);
    } catch (error) {
        console.error(error);
        // volvemos a mostrar el formulario con los datos que había escrito
        res.status(error.status || 500).render("hero/create", { hero: req.body, error: error.message });
    }
}


// ------------------ R (Read)---------------------------------------------
// lista de héroes
const getAll = async (req, res) => {
    try {
        const heroes = await heroRepository.getAll();
        res.render("hero/list", { heroes });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("hero/list", { heroes: [] });
    }
};

// ficha del héroe
// además del héroe, cargamos los poderes que se le pueden asignar
const getById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const hero = await heroRepository.getById(id);
        const availablePowers = await getAvailablePowers(hero);
        res.render("hero/show", { hero, availablePowers, newPower: {}, error: null });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("hero/show", { hero: null });
    }
};


// ---------------- U (Update) -----------------------------------

// vista del formulario de edición
const updateForm = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const hero = await heroRepository.getById(id);
        res.render("hero/edit", { hero, error: null });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).redirect("/hero");
    }
}

// cambiar el héroe por completo
const update = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const hero = await heroRepository.update(id, req.body);
        res.redirect("/hero/" + hero.heroId);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("hero/edit", { hero: { ...req.body, heroId: id }, error: error.message });
    }
}


// ------------------------ D (Delete)------------

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await heroRepository.remove(id);
        res.redirect("/hero");
    } catch (error) {
        console.error(error);
        res.redirect("/hero");
    }
}


// ------------------------ Poderes del héroe ------------

// asignar un poder que ya existe
const addPower = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const powerId = parseInt(req.body.powerId);
        await heroRepository.addPower(id, powerId);
        res.redirect("/hero/" + id);
    } catch (error) {
        console.error(error);
        res.redirect("/hero/" + id);
    }
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
        // volvemos a la ficha con el error y lo que había escrito
        const hero = await heroRepository.getById(id);
        const availablePowers = await getAvailablePowers(hero);
        res.status(error.status || 500).render("hero/show", { hero, availablePowers, newPower: req.body, error: error.message });
    }
}

// quitar un poder al héroe (el poder sigue existiendo)
const removePower = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const powerId = parseInt(req.params.powerId);
        await heroRepository.removePower(id, powerId);
        res.redirect("/hero/" + id);
    } catch (error) {
        console.error(error);
        res.redirect("/hero/" + id);
    }
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
