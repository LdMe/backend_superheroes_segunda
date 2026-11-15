import { Router } from "express";
import powerViewController from "../../controllers/power/power.view.controller.js";

const router = Router();

// ------------------ CRUD de power ----------------------------

// ------------------ C (Create)

// vista de formulario (antes que "/:id")
router.get("/new", powerViewController.createForm);

// creación de dato
router.post("/", powerViewController.create);

// ------------------ R (Read)---------------------------------------------
// lista de poderes
router.get("/", powerViewController.getAll);

// ficha de un poder
router.get("/:id", powerViewController.getById);

// ---------------- U (Update) -----------------------------------

// vista de edición del poder
router.get("/:id/edit", powerViewController.updateForm);

// guardar los cambios
router.post("/:id/edit", powerViewController.update);


// ------------------------ D (Delete)------------

router.post("/:id/delete", powerViewController.remove);


export default router;
