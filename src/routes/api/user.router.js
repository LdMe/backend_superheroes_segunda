import { Router } from "express";
import userApiController from "../../controllers/user/user.api.controller.js";

const router = Router();

// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)
router.post("/",userApiController.create)

// ------------------ R (Read)---------------------------------------------
router.get("/",userApiController.getAll);

router.get("/:id", userApiController.getById)

// ---------------- U (Update) -----------------------------------
// cambiar el dato por completo
router.put("/:id",userApiController.update)

// cambiar parte del dato
router.patch("/:id",userApiController.modify)

// ------------------------ D (Delete)------------

router.delete("/:id",userApiController.remove)


export default router;