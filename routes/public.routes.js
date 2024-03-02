import { Router } from "express"
import { getProducts, getProduct, checkoutFinish } from "../controllers/public.controllers.js"

const router = Router()


router.get("/getProducts", getProducts)

router.get("/getProduct/:id", getProduct)

router.post("/checkoutFinish", checkoutFinish)

export default router;