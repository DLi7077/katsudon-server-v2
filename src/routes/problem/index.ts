import express from "express";
import { createProblem, findProblems, present, presentAll } from "./resources";

const router = express.Router();

router.post("/create", createProblem, present);
router.get("/all", findProblems, presentAll);

export default router;
