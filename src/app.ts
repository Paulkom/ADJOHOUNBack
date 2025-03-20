import bodyParser = require("body-parser")
import cookieParser = require("cookie-parser")
import cors = require("cors");
const fs = require("fs");

// import * as express from "express";
const express = require('express');
import 'dotenv/config'

import { Server, Socket } from "socket.io";
// Création du serveur HTTP basé sur Express

const compression = require('compression');
import { myDataSource } from "./configs/data-source"
import { authentication } from "./modules/gestiondesutilisateurs/route/auth.route"
import { rolesRoutes } from "./modules/gestiondesutilisateurs/route/role.route";
import { userRoutes } from "./modules/gestiondesutilisateurs/route/user.route";
import { permissionsRoutes } from "./modules/gestiondesutilisateurs/route/permission.route";
import { affectationsRoutes } from "./modules/gestiondesutilisateurs/route/affectation.route";
import { journalRoutes } from "./modules/gestiondesutilisateurs/route/journal.route";
import { isAuthenticatedOne } from "./middlewares/auth.middleware";
import { communes_routes } from "./modules/gestiondesagences/route/commune.route";
import { arrondissementsRoutes } from "./modules/gestiondesagences/route/arrondissement.route";
import { parcelleRouter } from "./modules/gestiondesparcelles/route/parecelle.route";
import { usagers_routes } from "./modules/gestiondesparcelles/route/usager.route";
import { quartiersRoutes } from "./modules/gestiondesagences/route/quartier.route";


require("dotenv").config();

if (process.env.NODE_ENV !== "prod") {
    //
}

//Initialisation et connection de la base de donnée
myDataSource.initialize().then(() => {
    //console.log("Data Source initialized successfully")
}).catch((err) => {
        console.error("Error during Data Source initialization:", err)
    }
)

// create and setup express app
const app = express()
app.use(compression());
app.use(express.json())

//gestion des cookie
app.use(cookieParser());


// Charger les certificats SSL (adapter les chemins aux fichiers réels)
// const options = {
//     key: fs.readFileSync("/etc/letsencrypt/live/ton-domaine.com/privkey.pem"),
//     cert: fs.readFileSync("/etc/letsencrypt/live/ton-domaine.com/fullchain.pem"),
// };

// const https = require("https");
// const server = https.createServer(options, app);
const http = require("http");
const server = http.createServer(app);
//gestion des fichier static
app.use('/uploads', express.static('uploads'));

//Autoriser les entrés json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//Gestion des cors
app.use(cors(
    {
        origin: ['http://localhost:3008', 'http://localhost:8080', 'http://localhost:8081', 'http://192.168.8.59:3003'],
        credentials: true
    }));



// Initialisation de Socket.io avec ce serveur
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3008', 'http://localhost:8080', 'http://localhost:8081', 'http://192.168.8.59:3003'],
        credentials: true
    },
});

authentication(app);
app.use(isAuthenticatedOne);

rolesRoutes(app);

communes_routes(app);

arrondissementsRoutes(app);

parcelleRouter(app);

quartiersRoutes(app);

usagers_routes(app);

userRoutes(app);

permissionsRoutes(app);

affectationsRoutes(app);

journalRoutes(app);



//Autorisation des entêtes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

/*
app.use('/api/generationdata', generedatas);
//auth
authentication(app);
//app.use(isAuthenticatedOne); 
//gestion des roles
rolesRoutes(app);
// journal connexion et operation
journalRoutes(app);
permissionsRoutes(app);
//gestions des utilisateurs
userRoutes(app);*/

// Écouteur Socket.io pour gérer les connexions
io.on("connection", (socket) => {
    console.log("Un client est connecté :", socket.id);
    // Gérer la déconnexion
    socket.on("disconnect", () => {
        console.log("Un client s'est déconnecté :", socket.id);
    });
});

// On gère les routes 404.
app.use(({ res }) => {
    const message = 'Le projet a bien démarré mais impossible de trouver la ressource demandée! Vous pouvez essayer une autre URL.'
    res.status(404).json({ message });
});

// start express server
//app.listen(process.env.PORT_SERVER)

server.listen(process.env.PORT_SERVER, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT_SERVER}`);
});

