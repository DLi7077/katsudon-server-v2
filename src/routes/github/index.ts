import express from "express";
import { getRepositoryContent, getSolutions, presentFiles } from "./resources";

const router = express.Router();

router.get("/repository-files", getRepositoryContent, presentFiles);
router.get("/solution-file", getSolutions, presentFiles);

export default router;
