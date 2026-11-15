
import powerRepository from "../../repositories/power.repository.js";
import { getErrorMessage, getErrorStatus } from "../../utils/errors.js";


// ------------------ CRUD de power ----------------------------

// ------------------ C (Create)
// POST /api/power
const create = async (req, res) => {
    try {
        const power = await powerRepository.create(req.body);
        res.status(201).json({ data: power });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// ------------------ R (Read)---------------------------------------------
// GET /api/power
const getAll = async (req, res) => {
    const powers = await powerRepository.getAll();
    res.json({ data: powers });
};

// GET /api/power/:id
const getById = async (req, res) => {
    const id = parseInt(req.params.id);
    const power = await powerRepository.getById(id);
    if (!power) {
        return res.status(404).json({ error: "Poder no encontrado" });
    }
    res.json({ data: power });
};

// ---------------- U (Update) -----------------------------------
// PUT /api/power/:id  -> cambiar el dato por completo
const update = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const power = await powerRepository.update(id, req.body);
        if (!power) {
            return res.status(404).json({ error: "Poder no encontrado" });
        }
        res.json({ data: power });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// PATCH /api/power/:id  -> cambiar solo una parte del dato
const modify = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const power = await powerRepository.modify(id, req.body);
        if (!power) {
            return res.status(404).json({ error: "Poder no encontrado" });
        }
        res.json({ data: power });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// ------------------------ D (Delete)------------
// DELETE /api/power/:id
const remove = async (req, res) => {
    const id = parseInt(req.params.id);
    const power = await powerRepository.remove(id);
    if (!power) {
        return res.status(404).json({ error: "Poder no encontrado" });
    }
    res.json({ data: power });
}


export default {
    create,
    getAll,
    getById,
    update,
    modify,
    remove
}
