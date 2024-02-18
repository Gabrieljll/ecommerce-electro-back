import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import multer from 'multer';

const __filename = fileURLToPath(
  import.meta.url);

const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Establece el directorio donde se almacenarán las imágenes
    cb(null, path.join(__dirname, 'productsImages/'));
  },
  filename: (req, file, cb) => {
    // Define el nombre del archivo en el servidor
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });