
import userRepository from "../../repositories/user.repository.js";

// La gestión de usuarios es solo para admins (hasRoleApi("admin") en user.router.js),
// salvo GET /api/user/me, que devuelve el usuario del token.


// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)
// POST /api/user
const create = async (req, res) => {
    try {
        const user = await userRepository.create(req.body);
        res.status(201).json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// ------------------ R (Read)---------------------------------------------
// GET /api/user
const getAll = async (req, res) => {
    try {
        const users = await userRepository.getAll();
        res.json({ data: users });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

// GET /api/user/:id
const getById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userRepository.getById(id);
        res.json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

// GET /api/user/me  -> el usuario del token, con sus héroes
const me = async (req, res) => {
    try {
        const user = await userRepository.getById(req.user.userId);
        res.json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

// ---------------- U (Update) -----------------------------------
// PUT /api/user/:id  -> cambiar el dato por completo
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userRepository.update(id, req.body);
        res.json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// PATCH /api/user/:id  -> cambiar solo una parte del dato
const modify = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userRepository.modify(id, req.body);
        res.json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// ------------------------ D (Delete)------------
// DELETE /api/user/:id
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userRepository.remove(id);
        res.json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}


export default {
    create,
    getAll,
    getById,
    me,
    update,
    modify,
    remove
}
