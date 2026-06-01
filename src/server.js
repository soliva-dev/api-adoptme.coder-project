import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    console.error('ERROR: La variable de entorno MONGO_URL no está definida. Revisá el archivo .env');
    process.exit(1);
}

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('Conectado a MongoDB Atlas');
        app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar a MongoDB:', err.message);
        process.exit(1);
    });
