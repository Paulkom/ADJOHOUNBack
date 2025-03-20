import * as express from 'express';
import { createReclamation, deleteReclamation, getAllReclamation, getAllReclamations, getReclamation, updateReclamation } from '../controller/reclamation.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';


export  const reclamations_routes =  (router: express.Router) => {

  router.post('/api/reclamations',checkPermission('AddReclamation'), createReclamation);
  router.get('/api/all/reclamations',checkPermission('ListeReclamation'), getAllReclamation);
  router.get('/api/all/reclamation', getAllReclamation);
  router.get('/api/reclamations/:id', getReclamation);
  router.delete('/api/reclamations/:id',checkPermission('DeleteReclamation'),deleteReclamation);
  router.put('/api/reclamations/:id',checkPermission('UpdateReclamation'), updateReclamation);

};