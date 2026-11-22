import { Router } from "express";
import heroApiController from "../../controllers/hero/hero.api.controller.js";
import { isAuthenticatedApi, isHeroOwnerApi } from "../../middlewares/auth.middleware.js";
import { isValidIdApi } from "../../middlewares/validation.middleware.js";

const router = Router();

// si la URL trae un :id o :powerId que no es un número, respondemos 400
// antes de llegar a los middlewares de permisos o al controlador
router.param("id", isValidIdApi);
router.param("powerId", isValidIdApi);

// Permisos (igual que en las vistas, pero con el token JWT):
// - ver héroes: cualquiera
// - crear héroe: con token (isAuthenticatedApi)
// - editar, borrar y gestionar sus poderes: su creador o un admin (isAuthenticatedApi + isHeroOwnerApi)

// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)
router.post("/", isAuthenticatedApi, heroApiController.create);

// ------------------ R (Read)---------------------------------------------
router.get("/", heroApiController.getAll);
router.get("/:id", heroApiController.getById);

// ---------------- U (Update) -----------------------------------
// cambiar el dato por completo
router.put("/:id", isAuthenticatedApi, isHeroOwnerApi, heroApiController.update);
// cambiar parte del dato
router.patch("/:id", isAuthenticatedApi, isHeroOwnerApi, heroApiController.modify);

// ------------------------ D (Delete)------------
router.delete("/:id", isAuthenticatedApi, isHeroOwnerApi, heroApiController.remove);


// ------------------------ Poderes del héroe (N:M) ------------
// crear un poder nuevo y asignárselo
router.post("/:id/powers", isAuthenticatedApi, isHeroOwnerApi, heroApiController.createPower);
// asignar un poder existente
router.post("/:id/powers/:powerId", isAuthenticatedApi, isHeroOwnerApi, heroApiController.addPower);
// quitar un poder
router.delete("/:id/powers/:powerId", isAuthenticatedApi, isHeroOwnerApi, heroApiController.removePower);


export default router;
