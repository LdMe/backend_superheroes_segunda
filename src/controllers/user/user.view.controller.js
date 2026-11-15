
import userRepository from "../../repositories/user.repository.js";
import { getErrorMessage } from "../../utils/errors.js";

const ROLES = ["user", "admin"];


// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)

// vista del formulario de creación
const createForm = (req, res) => {
    res.render("user/create", { roles: ROLES, user: {}, error: null });
}

// crear el usuario
const create = async (req, res) => {
    const { username, email, password, passwordRepeat, role } = req.body;
    // los datos que había escrito, para volver a rellenar el formulario si hay error
    // (las contraseñas no se devuelven nunca)
    const formData = { username, email, role };

    if (!password) {
        return res.render("user/create", { roles: ROLES, user: formData, error: "La contraseña es obligatoria" });
    }
    if (password !== passwordRepeat) {
        return res.render("user/create", { roles: ROLES, user: formData, error: "Las contraseñas no coinciden" });
    }
    try {
        const user = await userRepository.create({ username, email, password, role });
        res.redirect("/user/" + user.userId);
    } catch (error) {
        console.error(error);
        res.render("user/create", { roles: ROLES, user: formData, error: getErrorMessage(error) });
    }
}


// ------------------ R (Read)---------------------------------------------
// lista de usuarios
const getAll = async (req, res) => {
    const users = await userRepository.getAll();
    res.render("user/list", { users });
};

// ficha del usuario
const getById = async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userRepository.getById(id);
    if (!user) {
        return res.status(404).render("user/show", { user: null });
    }
    res.render("user/show", { user });
};


// ---------------- U (Update) -----------------------------------

// vista del formulario de edición
const updateForm = async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userRepository.getById(id);
    if (!user) {
        return res.redirect("/user");
    }
    res.render("user/edit", { roles: ROLES, user, error: null });
}

// guardar los cambios
// usamos modify (y no update) porque la contraseña es opcional:
// si se deja vacía, se mantiene la que tenía
const update = async (req, res) => {
    const id = parseInt(req.params.id);
    const { username, email, password, passwordRepeat, role } = req.body;
    const formData = { userId: id, username, email, role };

    if (password !== passwordRepeat) {
        return res.render("user/edit", { roles: ROLES, user: formData, error: "Las contraseñas no coinciden" });
    }
    try {
        const user = await userRepository.modify(id, { username, email, password, role });
        if (user) {
            res.redirect("/user/" + user.userId);
        } else {
            res.redirect("/user");
        }
    } catch (error) {
        console.error(error);
        res.render("user/edit", { roles: ROLES, user: formData, error: getErrorMessage(error) });
    }
}


// ------------------------ D (Delete)------------

const remove = async (req, res) => {
    const id = parseInt(req.params.id);
    await userRepository.remove(id);
    res.redirect("/user");
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
