import * as express from 'express';
import { createArrondissement, deleteArrondissement, getAllArrondissement, getArrondissement, getArrondissementByCommune, updateArrondissement } from '../controller/arrondissement.controller';

export  const arrondissementsRoutes =  (router: express.Router) => {
  router.post('/api/arrondissements', createArrondissement);
  router.get('/api/arrondissements', getAllArrondissement);
  router.get('/api/arrondissements/:id', getArrondissement);
  router.get('/api/communes/arrondissements/:id', getArrondissementByCommune);
  router.delete('/api/arrondissements/:id',deleteArrondissement);
  router.put('/api/arrondissements/:id', updateArrondissement);
};