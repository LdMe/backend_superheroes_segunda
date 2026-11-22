import { Router } from "express";
import authApiController from "../../controllers/auth/auth.api.controller.js";


const router = Router();

// rutas públicas: cualquiera puede registrarse o pedir un token

router.post("/register", authApiController.register);

router.post("/login", authApiController.login);

// en la API no hay logout: el token es del cliente y basta con que lo olvide
// (o esperar a que caduque)

export default router;
