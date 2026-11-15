import { Router } from "express";
import powerApiController from "../../controllers/power/power.api.controller.js";

const router = Router();

// ------------------ CRUD de power ----------------------------

// ------------------ C (Create)
router.post("/", powerApiController.create);

// ------------------ R (Read)---------------------------------------------
router.get("/", powerApiController.getAll);
router.get("/:id", powerApiController.getById);

// ---------------- U (Update) -----------------------------------
// cambiar el dato por completo
router.put("/:id", powerApiController.update);
// cambiar parte del dato
router.patch("/:id", powerApiController.modify);

// ------------------------ D (Delete)------------
router.delete("/:id", powerApiController.remove);


export default router;
