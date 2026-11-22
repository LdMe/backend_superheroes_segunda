
import userRepository from "../../repositories/user.repository.js";

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
        res.status(error.status || 500).render("user/create", { roles: ROLES, user: formData, error: error.message });
    }
}


// ------------------ R (Read)---------------------------------------------
// lista de usuarios
const getAll = async (req, res) => {
    try {
        const users = await userRepository.getAll();
        res.render("user/list", { users });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("user/list", { users: [] });
    }
};

// ficha del usuario
const getById = async (req, res) => {
    try {
    const id = parseInt(req.params.id);
    const user = await userRepository.getById(id);
    res.render("user/show", { user });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("user/show", { user: null });
    }
};

// ficha del usuario logueado ("Mis héroes")
// es la misma vista que getById, pero el id sale de la sesión y no de la URL
const me = async (req, res) => {
    try {
        const user = await userRepository.getById(req.user.userId);
        res.render("user/show", { user });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).render("user/show", { user: null });
    }
};


// ---------------- U (Update) -----------------------------------

// vista del formulario de edición
const updateForm = async (req, res) => {
    try{
        const id = parseInt(req.params.id);
        const user = await userRepository.getById(id);
        res.render("user/edit", { roles: ROLES, user, error: null });
    }catch (error) {
        console.error(error);
        res.status(error.status || 500).render("user/edit", { roles: ROLES, user: null, error: error.message });
    }
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
        res.status(error.status || 500).render("user/edit", { roles: ROLES, user: formData, error: error.message });
    }
}


// ------------------------ D (Delete)------------

const remove = async (req, res) => {
    try{
        const id = parseInt(req.params.id);
        await userRepository.remove(id);
        res.redirect("/user");
    }catch (error) {
        console.error(error);
        res.status(error.status || 500).redirect("/user");
    }
}


export default {
    create,
    getAll,
    getById,
    me,
    update,
    createForm,
    updateForm,
    remove
}
