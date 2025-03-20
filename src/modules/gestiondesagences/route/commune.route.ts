import * as express from 'express';
import { createCommune, deleteCommune, getAllCommunes, getCommune, getCommuneBykey, getCommunes, updateCommune } from '../controller/commune.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const communes_routes =  (router: express.Router) => {
  router.post('/api/communes', createCommune);
  router.get('/api/all/communes',getAllCommunes);
  router.get('/api/communes', getCommunes);
  router.get('/api/communes/:id', getCommune);
  router.get('/api/communes/recherche/:cle', getCommuneBykey);
  router.delete('/api/communes/:id', deleteCommune);
  router.put('/api/communes/:id',updateCommune);
};