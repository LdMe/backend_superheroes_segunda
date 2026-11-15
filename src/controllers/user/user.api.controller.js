
import userRepository from "../../repositories/user.repository.js";
import { getErrorMessage, getErrorStatus } from "../../utils/errors.js";


// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)
// POST /api/user
const create = async (req, res) => {
    try {
        const user = await userRepository.create(req.body);
        res.status(201).json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// ------------------ R (Read)---------------------------------------------
// GET /api/user
const getAll = async (req, res) => {
    const users = await userRepository.getAll();
    res.json({ data: users });
};

// GET /api/user/:id
const getById = async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userRepository.getById(id);
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ data: user });
};

// ---------------- U (Update) -----------------------------------
// PUT /api/user/:id  -> cambiar el dato por completo
const update = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const user = await userRepository.update(id, req.body);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// PATCH /api/user/:id  -> cambiar solo una parte del dato
const modify = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const user = await userRepository.modify(id, req.body);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
    }
}

// ------------------------ D (Delete)------------
// DELETE /api/user/:id
const remove = async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userRepository.remove(id);
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ data: user });
}


export default {
    create,
    getAll,
    getById,
    update,
    modify,
    remove
}
