import { pool } from "../db.js"

export const getProducts = async(req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM productos")
    res.json(result)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

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