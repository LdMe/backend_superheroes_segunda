
import powerRepository from "../../repositories/power.repository.js";
import { getErrorMessage } from "../../utils/errors.js";


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
        res.render("power/create", { power: req.body, error: getErrorMessage(error) });
    }
}


// ------------------ R (Read)---------------------------------------------
// lista de poderes
const getAll = async (req, res) => {
    const powers = await powerRepository.getAll();
    res.render("power/list", { powers });
};

// ficha del poder, con los héroes que lo tienen
const getById = async (req, res) => {
    const id = parseInt(req.params.id);
    const power = await powerRepository.getById(id);
    if (!power) {
        return res.status(404).render("power/show", { power: null });
    }
    res.render("power/show", { power });
};


// ---------------- U (Update) -----------------------------------

// vista del formulario de edición
const updateForm = async (req, res) => {
    const id = parseInt(req.params.id);
    const power = await powerRepository.getById(id);
    if (!power) {
        return res.redirect("/power");
    }
    res.render("power/edit", { power, error: null });
}

// cambiar el poder por completo
const update = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const power = await powerRepository.update(id, req.body);
        if (power) {
            res.redirect("/power/" + power.powerId);
        } else {
            res.redirect("/power");
        }
    } catch (error) {
        console.error(error);
        res.render("power/edit", { power: { ...req.body, powerId: id }, error: getErrorMessage(error) });
    }
}


// ------------------------ D (Delete)------------
// al borrar un poder, PostgreSQL borra también sus filas de hero_powers
// (ON DELETE CASCADE), así que desaparece de todos los héroes que lo tenían

const remove = async (req, res) => {
    const id = parseInt(req.params.id);
    await powerRepository.remove(id);
    res.redirect("/power");
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
