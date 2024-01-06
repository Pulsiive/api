import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import api from './Routes/api';
import admin from './Routes/admin';
import http from 'http';
import WebSocket from 'ws';
import prisma from "../prisma/client";
import JWTService from "./Services/JWTService";

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(api);
app.use(admin);

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: any) => {
    console.log('Nouvelle connexion WebSocket établie.');

    ws.on('message', async (accessToken: Buffer) => {
        try {
            const user = await JWTService.verifyWrapper(accessToken.toString()) as any;

            const reqUser = await prisma.user.findUnique({where: {id: user.payload.id}});

            if (reqUser) {
                wss.clients.forEach((client: any) => {
                    if (client.id === user.payload.id) {
                        client.id = null;
                    }
                });
                ws.id = user.payload.id;
            }
        } catch (e: any) {
            console.log(e);
        }
    });
});

app.set("wss", wss)

server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
