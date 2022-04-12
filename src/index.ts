import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import api from './Routes/api';
import admin from './Routes/admin';

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(api);
app.use(admin);

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
