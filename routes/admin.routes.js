import { Router } from "express"
import { pool } from "../db.js"
import { getLineas, getCategorias } from "../controllers/public.controllers.js";
import { createProduct, updateProduct, deleteProduct, uploadImage, login } from "../controllers/admin.controllers.js";

const router = Router();

/* router.post("/login", async(req, res) => {
  const [rows] = await pool.query("SELECT")
  res.json("")
})
 */
router.get("/getLineas", getLineas);

router.get("/getCategorias", getCategorias);

router.post("/createProduct", uploadImage, createProduct)

router.post("/updateProduct", updateProduct)

router.delete("/deleteProduct/:id", deleteProduct)

router.post("/login", login)

export default router;