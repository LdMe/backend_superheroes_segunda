import { Router } from "express";
import heroViewController from "../../controllers/hero/hero.view.controller.js";
import { isAuthenticated, isHeroOwner } from "../../middlewares/auth.middleware.js";
import { isValidId } from "../../middlewares/validation.middleware.js";

const router = Router();

// si la URL trae un :id o :powerId que no es un número, respondemos 400
// antes de llegar a los middlewares de permisos o al controlador
router.param("id", isValidId);
router.param("powerId", isValidId);

// Permisos:
// - ver héroes: cualquiera
// - crear héroe: usuario logueado (isAuthenticated)
// - editar, borrar y gestionar sus poderes: su creador o un admin (isAuthenticated + isHeroOwner)
// Los middlewares se ejecutan en orden: isHeroOwner necesita el req.user que deja isAuthenticated.

// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)

// vista de formulario
// ¡ojo! tiene que ir antes que "/:id", si no Express tomaría "new" como un id
router.get("/new", isAuthenticated, heroViewController.createForm);

// creación de dato
router.post("/", isAuthenticated, heroViewController.create);

// ------------------ R (Read)---------------------------------------------
// lista de héroes
router.get("/", heroViewController.getAll);

// ficha de un héroe
router.get("/:id", heroViewController.getById);

// ---------------- U (Update) -----------------------------------

// vista de edición del héroe
router.get("/:id/edit", isAuthenticated, isHeroOwner, heroViewController.updateForm);

// guardar los cambios
router.post("/:id/edit", isAuthenticated, isHeroOwner, heroViewController.update);


// ------------------------ D (Delete)------------
// los formularios HTML solo envían GET y POST, por eso borramos con POST

router.post("/:id/delete", isAuthenticated, isHeroOwner, heroViewController.remove);


// ------------------------ Poderes del héroe (N:M) ------------

// asignar un poder existente (el powerId llega en el body)
router.post("/:id/powers", isAuthenticated, isHeroOwner, heroViewController.addPower);

// crear un poder nuevo y asignárselo
router.post("/:id/powers/new", isAuthenticated, isHeroOwner, heroViewController.createPower);

// quitar un poder
router.post("/:id/powers/:powerId/delete", isAuthenticated, isHeroOwner, heroViewController.removePower);


export default router;
