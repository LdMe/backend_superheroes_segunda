import { Router } from "express";
import apiRouter from "./api/api.router.js";
import viewRouter from "./view/view.router.js";


const router  = Router();

// la API va primero para que "/api/..." no lo intente resolver el router de vistas
router.use("/api",apiRouter);
router.use("/",viewRouter);

export default router;
