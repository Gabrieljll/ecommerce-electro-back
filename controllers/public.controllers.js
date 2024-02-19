import { pool } from "../db.js"
import fs from "fs"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(
  import.meta.url);

const __dirname = dirname(__filename);

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
        imagen: imageBase64,
        categoria: categoryResult[0].nombre_categoria,
        linea: lineResult[0].nombre,
        stock: product.stock
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

export const getProduct = (req, res) => {
  try {
    const [result] = pool.query("SELECT * FROM productos WHERE id = ?", [req.params.id])

    if (result.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    res.json(result[0]);

  } catch (error) {
    return res.status(500).json({ message: error.messaje })
  }

}

export const buyProducts = async(req, res) => {
  try {
    const { products } = req.body;

    // Verificar si se proporcionaron productos en la solicitud
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Debe proporcionar productos válidos para comprar." });
    }

    // Validar y actualizar el stock de cada producto
    for (const product of products) {
      const productId = product.id;
      const productName = product.name;
      const quantityToBuy = product.quantity;

      // Verificar si la cantidad deseada no excede el stock
      const [result] = await pool.query("SELECT stock FROM productos WHERE id = ?", [productId]);
      const currentStock = result[0].stock;

      if (quantityToBuy > currentStock) {
        return res.status(400).json({ message: `La cantidad deseada para el producto ${productName} excede el stock disponible.` });
      }

      // Restar la cantidad comprada al stock del producto
      await pool.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [quantityToBuy, productId]);
    }

    return res.json({ message: "Compra realizada con éxito." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStockProduct = async(req, res) => {
  try {
    const [result] = await pool.query("UPDATE productos SET ? WHERE id = ?", [req, body, req.params.id]);
    res.json(result)
  } catch (error) {
    return res.status(500).json({ message: error.messaje })
  }
}