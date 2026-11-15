import { Router } from "express";
import heroApiController from "../../controllers/hero/hero.api.controller.js";

const router = Router();

// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)
router.post("/", heroApiController.create);

// ------------------ R (Read)---------------------------------------------
router.get("/", heroApiController.getAll);
router.get("/:id", heroApiController.getById);

// ---------------- U (Update) -----------------------------------
// cambiar el dato por completo
router.put("/:id", heroApiController.update);
// cambiar parte del dato
router.patch("/:id", heroApiController.modify);

// ------------------------ D (Delete)------------
router.delete("/:id", heroApiController.remove);


// ------------------------ Poderes del héroe (N:M) ------------
// crear un poder nuevo y asignárselo
router.post("/:id/powers", heroApiController.createPower);
// asignar un poder existente
router.post("/:id/powers/:powerId", heroApiController.addPower);
// quitar un poder
router.delete("/:id/powers/:powerId", heroApiController.removePower);


export default router;
