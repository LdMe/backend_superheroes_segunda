import { Router } from "express";
import userViewController from "../../controllers/user/user.view.controller.js";
import { isAuthenticated, hasRole } from "../../middlewares/auth.middleware.js";

const router = Router();

// Permisos:
// - "Mis héroes" (/user/me): cualquier usuario logueado
// - el resto (gestión de usuarios): solo admin

// ------------------ Mis héroes ----------------------------
// antes que "/:id", si no Express tomaría "me" como un id
router.get("/me", isAuthenticated, userViewController.me);

// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)

// vista de formulario (antes que "/:id")
router.get("/new", isAuthenticated, hasRole("admin"), userViewController.createForm);

// creación de dato
router.post("/", isAuthenticated, hasRole("admin"), userViewController.create);

// ------------------ R (Read)---------------------------------------------
// lista de usuarios
router.get("/", isAuthenticated, hasRole("admin"), userViewController.getAll);

// ficha de un usuario
router.get("/:id", isAuthenticated, hasRole("admin"), userViewController.getById)

// ---------------- U (Update) -----------------------------------

// vista de edición del usuario
router.get("/:id/edit", isAuthenticated, hasRole("admin"), userViewController.updateForm);

// guardar los cambios
router.post("/:id/edit", isAuthenticated, hasRole("admin"), userViewController.update)



// ------------------------ D (Delete)------------
// los formularios HTML solo envían GET y POST, por eso borramos con POST

router.post("/:id/delete", isAuthenticated, hasRole("admin"), userViewController.remove)


export default router;
