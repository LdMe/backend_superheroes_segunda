import { Router } from "express";
import userRouter from "./user.router.js";
import heroRouter from "./hero.router.js";
import powerRouter from "./power.router.js";

const router  = Router();

router.get("/", (req, res) => {
    res.render("index");
})

router.use("/user",userRouter);
router.use("/hero",heroRouter);
router.use("/power",powerRouter);

export default router;
