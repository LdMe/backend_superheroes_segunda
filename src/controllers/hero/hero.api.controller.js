
import heroRepository from "../../repositories/hero.repository.js";
import powerRepository from "../../repositories/power.repository.js";
import { getHeroListOptions } from "../../utils/query.js";

// Los permisos (token válido, ser el creador o admin) los comprueban
// los middlewares en hero.router.js: aquí ya sabemos que se puede hacer.


// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)
// POST /api/hero
// el creador sale del token (req.user), nunca del body
const create = async (req, res) => {
    try {
        const { name, description } = req.body;
        const hero = await heroRepository.create({ name, description, userId: req.user.userId });
        res.status(201).json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// ------------------ R (Read)---------------------------------------------
// GET /api/hero?power=3&page=1&limit=6
// filtro opcional por poder y paginación (por defecto, página 1 de 6 en 6)
const getAll = async (req, res) => {
    try {
        const options = getHeroListOptions(req.query);
        const { heroes, pagination } = await heroRepository.getAll(options);
        res.json({ data: heroes, pagination });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

// GET /api/hero/:id
const getById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const hero = await heroRepository.getById(id);
        res.json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

// ---------------- U (Update) -----------------------------------
// PUT /api/hero/:id  -> cambiar el dato por completo
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const hero = await heroRepository.update(id, req.body);
        res.json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// PATCH /api/hero/:id  -> cambiar solo una parte del dato
const modify = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const hero = await heroRepository.modify(id, req.body);
        res.json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// ------------------------ D (Delete)------------
// DELETE /api/hero/:id
const remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const hero = await heroRepository.remove(id);
        res.json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}


// ------------------------ Poderes del héroe ------------

// POST /api/hero/:id/powers/:powerId  -> asignar un poder existente
const addPower = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const powerId = parseInt(req.params.powerId);
        await heroRepository.addPower(id, powerId);
        // devolvemos el héroe actualizado, con sus poderes y su nivel de utilidad
        const hero = await heroRepository.getById(id);
        res.json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// POST /api/hero/:id/powers  -> crear un poder nuevo y asignarlo
const createPower = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const power = await powerRepository.create(req.body);
        await heroRepository.addPower(id, power.powerId);
        const hero = await heroRepository.getById(id);
        res.status(201).json({ data: hero });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}

// DELETE /api/hero/:id/powers/:powerId  -> quitar un poder
const removePower = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const powerId = parseInt(req.params.powerId);
        await heroRepository.removePower(id, powerId);
        const hero = await heroRepository.getById(id);
        res.json({ data: hero });
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
    remove,
    addPower,
    createPower,
    removePower
}
