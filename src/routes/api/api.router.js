import { Router } from "express";

import userRouter from "./user.router.js";
import heroRouter from "./hero.router.js";
import powerRouter from "./power.router.js";
import authRouter from "./auth.router.js";
import { notFoundApi } from "../../middlewares/error.middleware.js";


const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "Hello from api" })
})

router.use("/user",userRouter);
router.use("/hero",heroRouter);
router.use("/power",powerRouter);
router.use("/auth",authRouter);

// si ninguna ruta de la API ha respondido, el endpoint no existe (404 en JSON)
router.use(notFoundApi);

export default router;