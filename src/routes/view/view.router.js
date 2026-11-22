import { Router } from "express";
import userRouter from "./user.router.js";
import heroRouter from "./hero.router.js";
import powerRouter from "./power.router.js";
import authRouter from "./auth.router.js";
import { notFound } from "../../middlewares/error.middleware.js";

const router  = Router();

router.get("/", (req, res) => {
    res.render("index");
})

router.use("/user",userRouter);
router.use("/hero",heroRouter);
router.use("/power",powerRouter);
router.use("/auth",authRouter);

// si ninguna ruta ha respondido, la página no existe (404 con la vista de error)
router.use(notFound);

export default router;
