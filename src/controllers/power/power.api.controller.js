
import powerRepository from "../../repositories/power.repository.js";

// Crear, editar y borrar poderes solo lo puede hacer un admin:
// lo comprueba el middleware hasRoleApi("admin") en power.router.js


// ------------------ CRUD de power ----------------------------

// ------------------ C (Create)
// POST /api/power
const create = async (req, res) => {
    try {
        const power = await powerRepository.create(req.body);
        res.status(201).json({ data: power });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// ------------------ R (Read)---------------------------------------------
// GET /api/power
const getAll = async (req, res) => {
    try {
        const powers = await powerRepository.getAll();
        res.json({ data: powers });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

// GET /api/power/:id
const getById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const power = await powerRepository.getById(id);
        res.json({ data: power });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

// ---------------- U (Update) -----------------------------------
// PUT /api/power/:id  -> cambiar el dato por completo
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const power = await powerRepository.update(id, req.body);
        res.json({ data: power });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// PATCH /api/power/:id  -> cambiar solo una parte del dato
const modify = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const power = await powerRepository.modify(id, req.body);
        res.json({ data: power });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// ------------------------ D (Delete)------------
// DELETE /api/power/:id
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const power = await powerRepository.remove(id);
        res.json({ data: power });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}


export default {
    create,
    getAll,
    getById,
    update,
    modify,
    remove
}
