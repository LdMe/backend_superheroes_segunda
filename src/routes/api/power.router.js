import { Router } from "express";
import powerApiController from "../../controllers/power/power.api.controller.js";
import { isAuthenticatedApi, hasRoleApi } from "../../middlewares/auth.middleware.js";

const router = Router();

// Permisos:
// - ver poderes: cualquiera
// - crear, editar y borrar: solo admin (isAuthenticatedApi + hasRoleApi("admin"))

// ------------------ CRUD de power ----------------------------

// ------------------ C (Create)
router.post("/", isAuthenticatedApi, hasRoleApi("admin"), powerApiController.create);

// ------------------ R (Read)---------------------------------------------
router.get("/", powerApiController.getAll);
router.get("/:id", powerApiController.getById);

// ---------------- U (Update) -----------------------------------
// cambiar el dato por completo
router.put("/:id", isAuthenticatedApi, hasRoleApi("admin"), powerApiController.update);
// cambiar parte del dato
router.patch("/:id", isAuthenticatedApi, hasRoleApi("admin"), powerApiController.modify);

// ------------------------ D (Delete)------------
router.delete("/:id", isAuthenticatedApi, hasRoleApi("admin"), powerApiController.remove);


export default router;
