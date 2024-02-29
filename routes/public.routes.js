import { Router } from "express"
import { getProducts, getProduct, buyProducts, notifyBuy } from "../controllers/public.controllers.js"

const router = Router()


router.get("/getProducts", getProducts)

router.get("/getProduct/:id", getProduct)

router.post("/products/buy", buyProducts)

router.post("/notifyBuy", notifyBuy)

export default router;