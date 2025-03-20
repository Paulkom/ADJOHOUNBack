import * as express from 'express';
import { createQuartier, deleteQuartier, getAllQuartier, getAllQuartierByKey, getQuartier, getQuartierByArrondissement, updateQuartier } from '../controller/quartier.controller';

export  const quartiersRoutes =  (router: express.Router) => {
  router.post('/api/quartiers', createQuartier);
  router.get('/api/quartiers', getAllQuartier);
  router.get('/api/quartiers/:id', getQuartier);
  router.get('/api/quartier/by/:key', getAllQuartierByKey);
  router.get('/api/arrondissements/quartiers/:id', getQuartierByArrondissement);
  router.delete('/api/quartiers/:id',deleteQuartier);
  router.put('/api/quartiers/:id', updateQuartier);
};