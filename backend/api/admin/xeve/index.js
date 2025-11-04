import express from "express";
import sukienRoutes from "./sukien/index.js";
import datveRoutes from "./datve/index.js";

const router = express.Router();

router.use("/sukien", sukienRoutes);
router.use("/datve", datveRoutes);

export default router;
