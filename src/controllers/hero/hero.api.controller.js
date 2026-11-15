
import heroRepository from "../../repositories/hero.repository.js";
import powerRepository from "../../repositories/power.repository.js";
import { getErrorMessage, getErrorStatus } from "../../utils/errors.js";


// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)
// POST /api/hero
// (cuando tengamos login, el userId saldrá del token y no del body)
const create = async (req, res) => {
    try {
        const hero = await heroRepository.create(req.body);
        res.status(201).json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// ------------------ R (Read)---------------------------------------------
// GET /api/hero
const getAll = async (req, res) => {
    const heroes = await heroRepository.getAll();
    res.json({ data: heroes });
};

// GET /api/hero/:id
const getById = async (req, res) => {
    const id = parseInt(req.params.id);
    const hero = await heroRepository.getById(id);
    if (!hero) {
        return res.status(404).json({ error: "Héroe no encontrado" });
    }
    res.json({ data: hero });
};

// ---------------- U (Update) -----------------------------------
// PUT /api/hero/:id  -> cambiar el dato por completo
const update = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const hero = await heroRepository.update(id, req.body);
        if (!hero) {
            return res.status(404).json({ error: "Héroe no encontrado" });
        }
        res.json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// PATCH /api/hero/:id  -> cambiar solo una parte del dato
const modify = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const hero = await heroRepository.modify(id, req.body);
        if (!hero) {
            return res.status(404).json({ error: "Héroe no encontrado" });
        }
        res.json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// ------------------------ D (Delete)------------
// DELETE /api/hero/:id
const remove = async (req, res) => {
    const id = parseInt(req.params.id);
    const hero = await heroRepository.remove(id);
    if (!hero) {
        return res.status(404).json({ error: "Héroe no encontrado" });
    }
    res.json({ data: hero });
}


// ------------------------ Poderes del héroe ------------

// POST /api/hero/:id/powers/:powerId  -> asignar un poder existente
const addPower = async (req, res) => {
    const id = parseInt(req.params.id);
    const powerId = parseInt(req.params.powerId);
    const hero = await heroRepository.addPower(id, powerId);
    if (!hero) {
        return res.status(404).json({ error: "Héroe o poder no encontrado" });
    }
    // devolvemos el héroe actualizado, con sus poderes y su nivel de utilidad
    const updatedHero = await heroRepository.getById(id);
    res.json({ data: updatedHero });
}

// POST /api/hero/:id/powers  -> crear un poder nuevo y asignarlo
const createPower = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const hero = await heroRepository.getById(id);
        if (!hero) {
            return res.status(404).json({ error: "Héroe no encontrado" });
        }
        const power = await powerRepository.create(req.body);
        await heroRepository.addPower(id, power.powerId);
        const updatedHero = await heroRepository.getById(id);
        res.status(201).json({ data: updatedHero });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// DELETE /api/hero/:id/powers/:powerId  -> quitar un poder
const removePower = async (req, res) => {
    const id = parseInt(req.params.id);
    const powerId = parseInt(req.params.powerId);
    const hero = await heroRepository.removePower(id, powerId);
    if (!hero) {
        return res.status(404).json({ error: "Héroe o poder no encontrado" });
    }
    const updatedHero = await heroRepository.getById(id);
    res.json({ data: updatedHero });
}


export default {
    create,
    getAll,
    getById,
    update,
    modify,
    remove,
    addPower,
    createPower,
    removePower
}
