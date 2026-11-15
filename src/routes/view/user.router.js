import { Router } from "express";
import userViewController from "../../controllers/user/user.view.controller.js";

const router = Router();

// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)

// vista de formulario (antes que "/:id")
router.get("/new",userViewController.createForm);

// creación de dato
router.post("/",userViewController.create);

// ------------------ R (Read)---------------------------------------------
// lista de usuarios
router.get("/",userViewController.getAll);

// ficha de un usuario
router.get("/:id", userViewController.getById)

// ---------------- U (Update) -----------------------------------

// vista de edición del usuario
router.get("/:id/edit",userViewController.updateForm);

// guardar los cambios
router.post("/:id/edit",userViewController.update)



// ------------------------ D (Delete)------------
// los formularios HTML solo envían GET y POST, por eso borramos con POST

router.post("/:id/delete",userViewController.remove)


export default router;