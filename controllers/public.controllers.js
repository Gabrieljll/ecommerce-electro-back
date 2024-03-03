import { pool } from "../db.js"
import fs from "fs"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';
import { google } from "googleapis"
import nodemailer from "nodemailer"


dotenv.config();


const __filename = fileURLToPath(
  import.meta.url);

const __dirname = dirname(__filename);


const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const EMAIL_WEB = process.env.EMAIL_WEB

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })






export const getProducts = async(req, res) => {
  try {
    // Obtener productos desde la tabla productos
    const [result] = await pool.query("SELECT * FROM productos");

    // Crear un array para almacenar los productos con información adicional
    const productsWithImages = await Promise.all(result.map(async(product) => {
      // Leer la imagen del archivo y convertirla en base64
      const imagePath = path.join(__dirname, "..", "productsImages", product.imagen);
      const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });

      // Obtener el nombre de la categoría y la línea correspondientes a través de consultas adicionales
      const [categoryResult] = await pool.query("SELECT nombre_categoria FROM categorias WHERE id = ?", [product.id_categoria]);
      const [lineResult] = await pool.query("SELECT nombre FROM linea_productos WHERE id = ?", [product.id_linea]);

      // Crear un nuevo objeto con la información del producto y la imagen en base64, así como los nombres de categoría y línea
      const productWithImageAndNames = {
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        descripcion: product.descripcion,
        imagen: imageBase64,
        categoria: categoryResult[0].nombre_categoria,
        linea: lineResult[0].nombre,
        stock: product.stock,
        sku: product.sku
      };

      return productWithImageAndNames;
    }));

    res.json(productsWithImages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getLineas = async(req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM linea_productos")
    res.json(result)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const getCategorias = async(req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM categorias")
    res.json(result)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const getProduct = async(req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const product = result[0];

    // Leer la imagen del archivo y convertirla en base64
    const imagePath = path.join(__dirname, "..", "productsImages", product.imagen);
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });

    // Agregar la imagen en base64 al objeto del producto


    const productWithImage = {
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      descripcion: product.descripcion,
      imagen: imageBase64,
      stock: product.stock,
      sku: product.sku,
    };

    res.json(productWithImage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const checkoutFinish = async(req, res) => {
  try {

    const { products, userData } = req.body;

    // Verificar si se proporcionaron productos en la solicitud
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Debe proporcionar productos válidos para comprar." });
    }

    // Validar y actualizar el stock de cada producto
    for (const product of products) {
      const productId = product.id;
      const productName = product.nombre;
      const quantityToBuy = product.amount;

      // Verificar si la cantidad deseada no excede el stock
      const [result] = await pool.query("SELECT stock FROM productos WHERE id = ?", [productId]);
      const currentStock = result[0].stock;

      if (quantityToBuy > currentStock) {
        return res.status(400).json({ message: `La cantidad deseada para el producto ${productName} excede el stock disponible.` });
      }

      // Restar la cantidad comprada al stock del producto
      await pool.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [quantityToBuy, productId]);
    }
    await notifyBuy(products, userData)
    return res.json({ message: "Compra realizada con éxito." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//NOTIFICACIÓN CON DATOS DE LA COMPRA EN CASO DE SER EXITOSA
const notifyBuy = async(products, userData) => {
  // Lógica para confirmar la compra y enviar el correo electrónico
  try {
    const productsList = products.map(product => {
      return `<li>
              <strong>${product.nombre}</strong>
              <p>Precio: ${product.precio}</p>
              <p>Cantidad: ${product.amount}</p>
              <!-- Agrega más detalles según tus necesidades -->
            </li>`;
    }).join('');

    const userEmail = userData.email; // Asegúrate de tener el campo correcto en userData

    // Crear el cuerpo del correo electrónico con la plantilla HTML
    const emailBody = `
    <html>
      <head>
        <style>
          /* Agrega estilos CSS según tus preferencias */
          body {
            font-family: 'Arial', sans-serif;
          }
          .header {
            background-color: #f2f2f2;
            padding: 20px;
            text-align: center;
          }
          .details {
            margin: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>¡Compra exitosa!</h1>
        </div>
        <div class="details">
            <p>¡Gracias por tu compra! A continuación, se detallan los productos adquiridos:</p>          
            <p>Email del usuario: ${userEmail}</p>
          <ul>
            ${productsList}
          </ul>
        </div>
      </body>
    </html>`;

    const emailBodyPriv = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
            }
            .header {
              background-color: #f2f2f2;
              padding: 20px;
              text-align: center;
            }
            .details {
              margin: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>¡Nueva Compra!</h1>
          </div>
          <div class="details">
            <p>A continuación, se detallan datos del comprador y los productos adquiridos:</p>
            <p>Nombre y apellido del comprador: ${userData.nombre} ${userData.apellido}</p>
            <p>Datos de ubicación: ${userData.direccion}, ${userData.localidad}</p>
            <p>Número del comprador: ${userData.telefono}</p>
            <p>Email del comprador: ${userEmail}</p>
            <p>Lista de productos: </p>
            <ul>
              ${productsList}
            </ul>
          </div>
        </body>
      </html>`;

    const [emailData, emailDataEcommerce] = await Promise.all([
      sendEmail(userEmail, "Compra Exitosa", emailBody),
      sendEmail(EMAIL_WEB, "Nueva Compra", emailBodyPriv)
    ]);

    console.log(emailData)
    console.log(emailDataEcommerce)
    return emailData && emailDataEcommerce

    // Otro código relacionado con la confirmación de la compra, si es necesario
  } catch (error) {
    console.error('Error en la función notifyBuy:', error);
  }
};

export const sendAskMail = async(req, res) => {
  try {
    const { email, asunto, nya, mensaje } = req.body

    const emailBody = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
            }
            .header {
              background-color: #f2f2f2;
              padding: 20px;
              text-align: center;
            }
            .details {
              margin: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Mail de consulta de un posible cliente</h1>
          </div>
          <div class="details">
            <p>A continuación se detallan los datos de la persona y su consulta</p>
            <p>Nombre y apellido del: ${nya} </p>
            <p>Contacto de la persona: ${email}</p>
            <h2>Consulta:</h2>
            <p>${mensaje}</p>
            
          </div>
        </body>
      </html>`;

    const result = await sendEmail(EMAIL_WEB, asunto, emailBody)
    return res.status(200).json({
      message: "Consulta enviada!"
    })
  } catch (error) {
    console.error('Error en la función notifyBuy:', error);
  }

}


const sendEmail = async(to, subject, html) => {

  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "gabriel.leguizamon.gl@gmail.com",
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken
    }
  })


  const mailOptions = {
    from: "CJ Repuestos <gabriel.leguizamon.gl@gmail.com>",
    to: to,
    subject: subject,
    html: html
  };

  return transporter.sendMail(mailOptions);
};


export const updateStockProduct = async(req, res) => {
  try {
    const [result] = await pool.query("UPDATE productos SET ? WHERE id = ?", [req, body, req.params.id]);
    res.json(result)
  } catch (error) {
    return res.status(500).json({ message: error.messaje })
  }
}