import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
dotenv.config();

// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from "mercadopago";
//const access_token = process.env.ACCESS_TOKEN;
const client = new MercadoPagoConfig({
  accessToken: "TEST-3813879121312340-012217-dd7a2a50e5bc2ad63771a4a9cfa08089-458101383",
});

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Soy el server :)");
});

app.post("/create_preference", async(req, res) => {
  try {
    console.log(req.body)
    const items = await req.body.map(item => ({
      title: item.title,
      quantity: Number(item.amount),
      unit_price: Number(item.price),
      currency_id: "ARS",
    }));

    const body = {
      items,
      back_urls: {
        success: "https://ecommerce-electro.vercel.app/home",
        failure: "https://ecommerce-electro.vercel.app/home",
        pending: "https://ecommerce-electro.vercel.app/home",
      },
      auto_return: "approved",
    };
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONT_URL);
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");
    const preference = new Preference(client);
    const result = await preference.create({ body });
    res.json({
      id: result.id,
    });
    console.log(res.id)
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error al crear la preferencia :(",
    });
  }
});

app.listen(port, () => {
  console.log(`El servidor esta corriendo en el puerto ${port}`);
});