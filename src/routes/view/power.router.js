import { Router } from "express";
import powerViewController from "../../controllers/power/power.view.controller.js";
import { isAuthenticated, hasRole } from "../../middlewares/auth.middleware.js";
import { isValidId } from "../../middlewares/validation.middleware.js";

const router = Router();

// si la URL trae un :id que no es un número, respondemos 400
// antes de llegar a los middlewares de permisos o al controlador
router.param("id", isValidId);

// Permisos:
// - ver poderes: cualquiera
// - crear, editar y borrar poderes del catálogo: solo admin (isAuthenticated + hasRole("admin"))

// ------------------ CRUD de power ----------------------------

// ------------------ C (Create)

// vista de formulario (antes que "/:id")
router.get("/new", isAuthenticated, hasRole("admin"), powerViewController.createForm);

// creación de dato
router.post("/", isAuthenticated, hasRole("admin"), powerViewController.create);

// ------------------ R (Read)---------------------------------------------
// lista de poderes
router.get("/", powerViewController.getAll);

// ficha de un poder
router.get("/:id", powerViewController.getById);

// ---------------- U (Update) -----------------------------------

// vista de edición del poder
router.get("/:id/edit", isAuthenticated, hasRole("admin"), powerViewController.updateForm);

// guardar los cambios
router.post("/:id/edit", isAuthenticated, hasRole("admin"), powerViewController.update);


// ------------------------ D (Delete)------------

router.post("/:id/delete", isAuthenticated, hasRole("admin"), powerViewController.remove);


export default router;
