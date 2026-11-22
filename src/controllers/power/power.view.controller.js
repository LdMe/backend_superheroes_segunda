
import powerRepository from "../../repositories/power.repository.js";

// Crear, editar y borrar poderes solo lo puede hacer un admin:
// lo comprueba el middleware hasRole("admin") en power.router.js


// ------------------ CRUD de power ----------------------------

// ------------------ C (Create)

// vista del formulario de creación
const createForm = (req, res) => {
    res.render("power/create", { power: {}, error: null });
}

// crear el poder
const create = async (req, res) => {
    try {
        const power = await powerRepository.create(req.body);
        res.redirect("/power/" + power.powerId);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("power/create", { power: req.body, error: error.message });
    }
}


// ------------------ R (Read)---------------------------------------------
// lista de poderes
const getAll = async (req, res) => {
    try {
        const powers = await powerRepository.getAll();
        res.render("power/list", { powers });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("power/list", { powers: [] });
    }
};

// ficha del poder, con los héroes que lo tienen
const getById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const power = await powerRepository.getById(id);
        res.render("power/show", { power });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("power/show", { power: null });
    }
};


// ---------------- U (Update) -----------------------------------

// vista del formulario de edición
const updateForm = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const power = await powerRepository.getById(id);
        res.render("power/edit", { power, error: null });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).redirect("/power");
    }
}

// cambiar el poder por completo
const update = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const power = await powerRepository.update(id, req.body);
        res.redirect("/power/" + power.powerId);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("power/edit", { power: { ...req.body, powerId: id }, error: error.message });
    }
}


// ------------------------ D (Delete)------------
// al borrar un poder, PostgreSQL borra también sus filas de hero_powers
// (ON DELETE CASCADE), así que desaparece de todos los héroes que lo tenían

const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await powerRepository.remove(id);
        res.redirect("/power");
    } catch (error) {
        console.error(error);
        res.redirect("/power");
    }
}


export default {
    create,
    getAll,
    getById,
    update,
    createForm,
    updateForm,
    remove
}
