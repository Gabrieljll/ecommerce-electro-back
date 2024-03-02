import { Router } from "express"
import { getProducts, getProduct, checkoutFinish, sendAskMail } from "../controllers/public.controllers.js"

const router = Router()


router.get("/getProducts", getProducts)

router.get("/getProduct/:id", getProduct)

router.post("/checkoutFinish", checkoutFinish)

router.post("/sendAskMail", sendAskMail)

export default router;