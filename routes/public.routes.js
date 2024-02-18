import { Router } from "express"
import { getProducts, getProduct, buyProducts } from "../controllers/public.controllers.js"

const router = Router()


router.get("/getProducts", getProducts)

router.get("/products/:id", getProduct)

router.post("/products/buy", buyProducts)

export default router;