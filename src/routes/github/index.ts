import express from "express";
import { getRepositoryFiles, getSolution } from "./resources";

const router = express.Router();

router.get("/repository-files", getRepositoryFiles);
router.get("/solution-file", getSolution);

export default router;
