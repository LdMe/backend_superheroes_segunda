import { Router } from "express";
import userApiController from "../../controllers/user/user.api.controller.js";
import { isAuthenticatedApi, hasRoleApi } from "../../middlewares/auth.middleware.js";
import { isValidIdApi } from "../../middlewares/validation.middleware.js";

const router = Router();

// si la URL trae un :id que no es un número, respondemos 400
// antes de llegar a los middlewares de permisos o al controlador
router.param("id", isValidIdApi);

// Permisos:
// - GET /me: cualquier usuario con token
// - el resto (gestión de usuarios): solo admin

// ------------------ Mi usuario ----------------------------
// antes que "/:id", si no Express tomaría "me" como un id
router.get("/me", isAuthenticatedApi, userApiController.me);

// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)
router.post("/", isAuthenticatedApi, hasRoleApi("admin"), userApiController.create)

// ------------------ R (Read)---------------------------------------------
router.get("/", isAuthenticatedApi, hasRoleApi("admin"), userApiController.getAll);

router.get("/:id", isAuthenticatedApi, hasRoleApi("admin"), userApiController.getById)

// ---------------- U (Update) -----------------------------------
// cambiar el dato por completo
router.put("/:id", isAuthenticatedApi, hasRoleApi("admin"), userApiController.update)

// cambiar parte del dato
router.patch("/:id", isAuthenticatedApi, hasRoleApi("admin"), userApiController.modify)

// ------------------------ D (Delete)------------

router.delete("/:id", isAuthenticatedApi, hasRoleApi("admin"), userApiController.remove)


export default router;
