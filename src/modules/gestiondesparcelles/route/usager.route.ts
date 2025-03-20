import * as express from 'express';
import { listen } from '../../../configs/uploads';
import { createUsager, deleteUsager, getAllUsager, getAllUsagers, getUsager, getUsagerBykey, updateUsager } from '../controller/usager.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export const usagers_routes = (router: express.Router) => {

  
              
  router.post('/api/usagers', listen.fields([
    { name: "urlImage", maxCount: 1 },
    { name: "autreFichier[]", maxCount: 500 }
  ]),checkPermission('AddUsager'), createUsager);
  router.get('/api/all/usagers',checkPermission('ListeUsagers'), getAllUsagers);
  router.get('/api/all/usager', getAllUsager);
  router.get('/api/usagers/:id', getUsager);
  router.delete('/api/usagers/:id',checkPermission('DeleteUsager'), deleteUsager);
  router.get('/api/usagers/recherche/:cle', getUsagerBykey);
  router.put('/api/usagerxs/:id', listen.fields([
    { name: "urlImage", maxCount: 1 },
    { name: "autreFichier[]", maxCount: 500 }
  ]),checkPermission('UpdateUsager'), updateUsager);
};