import { pool } from "../db.js"
import { upload } from "../multerConfig.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';


dotenv.config();
const jwt_secret = process.env.SECRET_JSONWEBTOKEN

export const login = async(req, res) => {
  try {
    // Simulando una consulta a la base de datos para obtener el usuario
    const userFromDatabase = await getUserFromDatabase(req.body.nombre);

    if (!userFromDatabase) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Comparando la contraseña ingresada con la almacenada en la base de datos
    const passwordMatch = await bcrypt.compare(req.body.password, userFromDatabase.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // En este punto, el usuario ha sido autenticado exitosamente
    // Puedes generar un token de autenticación y enviarlo en la respuesta

    // Por ejemplo, usando jsonwebtoken (asegúrate de tenerlo instalado: npm install jsonwebtoken)

    const token = jwt.sign({ userId: userFromDatabase.id_user_admin }, jwt_secret, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error en la función de login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

async function getUserFromDatabase(username) {

  const [result] = await pool.query("SELECT * FROM user_admin WHERE  user_name = ?", [username]);

  return result[0]
}

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
    const { id, sku, nombre, precio, descripcion, linea, categoria, stock } = req.body;
    // Construye dinámicamente la parte SET de la consulta
    const updateColumns = [];
    if (sku) updateColumns.push(`sku = '${sku}'`);
    if (nombre) updateColumns.push(`nombre = '${nombre}'`);
    if (precio) updateColumns.push(`precio = ${precio}`);
    if (descripcion) updateColumns.push(`descripcion = '${descripcion}'`);
    if (linea) updateColumns.push(`id_linea = '${linea}'`);
    if (categoria) updateColumns.push(`id_categoria = '${categoria}'`);
    if (stock) updateColumns.push(`stock = ${stock}`);

    // Construye y ejecuta la consulta de actualización
    const updateQuery = `UPDATE productos SET ${updateColumns.join(', ')} WHERE id = ${id}`;
    const [result] = await pool.query(updateQuery);

    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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