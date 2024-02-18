import { pool } from "../db.js"
import { upload } from "../multerConfig.js"


export const createProduct = async(req, res) => {
  try {
    const { sku, nombre, precio, descripcion, linea, categoria, stock } = req.body;
    // req.file contiene la información del archivo subido por multer
    const file = req.file;
    // Guardar la referencia al archivo en la base de datos
    const [result] = await pool.query("INSERT INTO productos(nombre, descripcion, id_linea, id_categoria, precio, stock, imagen, sku) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [nombre, descripcion, linea, categoria, precio, stock, file.filename, sku]);

    res.json({
      id: result.insertId,
      mensaje: "Producto creado correctamente",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Aplica el middleware multer para 'imagen'
export const uploadImage = upload.single('imagen');

export const updateProduct = async(req, res) => {
  try {
    const [result] = await pool.query("UPDATE productos SET ? WHERE id = ?", [req, body, req.params.id]);
    res.json(result)
  } catch (error) {
    return res.status(500).json({ message: error.messaje })
  }
}

export const deleteProduct = async(req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM productos WHERE id = ?", [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    return res.sendStatus(204)
  } catch (error) {
    return res.status(500).json({ message: error.messaje })
  }

}