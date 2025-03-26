import * as express from 'express';
import { createParcelle, getParcelles, getParcelleById, updateParcelle, deleteParcelle,recupererListeParcelles } from '../controller/parcelle.controller';

export  const parcelleRouter =  (router: express.Router) => {
  router.post('/api/parcelles', createParcelle);
  router.post('/api/all/parcelles', getParcelles);
  router.get('/api/parcelles/:id', getParcelleById);
  router.delete('/api/parcelles/:id',deleteParcelle);
  router.put('/api/parcelles/:id', updateParcelle);
  router.get('/api/recuperation/parcelle', recupererListeParcelles);
};