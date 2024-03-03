import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import adminRoutes from "./routes/admin.routes.js"
import publicRoutes from "./routes/public.routes.js"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';




const __filename = fileURLToPath(
  import.meta.url);

const __dirname = dirname(__filename);





dotenv.config();

const ACCESS_TOKEN_MP = process.env.ACCESS_TOKEN_MP
const BACK_URL = process.env.BACK_URL
const FRONT_URL = process.env.FRONT_URL

// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from "mercadopago";
//const access_token = process.env.ACCESS_TOKEN;
const client = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN_MP,
});

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "productsImages")))
app.use(cors());

app.use(adminRoutes)
app.use(publicRoutes)



app.get("/", (req, res) => {
  res.send("Soy el server :)");
});


//CREA PREFERENCE PARA REALIZAR LA COMPRA
app.post("/create_preference", async(req, res) => {
  try {

    const { cart } = req.body;

    const items = cart.map(item => ({
      title: item.nombre,
      quantity: Number(item.amount),
      unit_price: Number(item.precio),
      currency_id: "ARS",
    }));

    const body = {
      items,
      back_urls: {
        //cambiar por urls del host
        success: FRONT_URL + "/checkoutPayment",
        failure: FRONT_URL + "/checkoutPayment",
        pending: FRONT_URL + "/checkoutPayment",
      },
      auto_return: "approved",
      //cambiar por url del host
      notification_url: BACK_URL
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });
    res.json({
      id: result.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error al crear la preferencia :(",
    });
  }
});

//CAPTURA DATOS DE LA COMPRA
app.post("/webhook", async(req, res) => {
  const paymentId = req.query.id;

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${client.accessToken}`
      }
    });

    if (response.ok) {
      console.log("llega")
      const data = await response.json()
    }
    res.sendStatus(200)
  } catch (error) {
    console.log('Error:', error)
    res.sendStatus(500)
  }
})


app.listen(port, () => {
  console.log(`El servidor esta corriendo en el puerto ${port}`);
});