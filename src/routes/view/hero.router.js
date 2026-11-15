import { Router } from "express";
import heroViewController from "../../controllers/hero/hero.view.controller.js";

const router = Router();

// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)

// vista de formulario
// ¡ojo! tiene que ir antes que "/:id", si no Express tomaría "new" como un id
router.get("/new", heroViewController.createForm);

// creación de dato
router.post("/", heroViewController.create);

// ------------------ R (Read)---------------------------------------------
// lista de héroes
router.get("/", heroViewController.getAll);

// ficha de un héroe
router.get("/:id", heroViewController.getById);

// ---------------- U (Update) -----------------------------------

// vista de edición del héroe
router.get("/:id/edit", heroViewController.updateForm);

// guardar los cambios
router.post("/:id/edit", heroViewController.update);


// ------------------------ D (Delete)------------
// los formularios HTML solo envían GET y POST, por eso borramos con POST

router.post("/:id/delete", heroViewController.remove);


// ------------------------ Poderes del héroe (N:M) ------------

// asignar un poder existente (el powerId llega en el body)
router.post("/:id/powers", heroViewController.addPower);

// crear un poder nuevo y asignárselo
router.post("/:id/powers/new", heroViewController.createPower);

// quitar un poder
router.post("/:id/powers/:powerId/delete", heroViewController.removePower);


export default router;
