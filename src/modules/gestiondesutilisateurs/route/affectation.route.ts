import * as express from 'express';
import { createAffectation, deleteAffectation, getAllAffectations, getAffectation, updateAffectation } from '../controller/affectation.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const affectationsRoutes =  (router: express.Router) => {
  // router.post('/api/affectations',checkPermission('AssignAgenceUser'), createAffectation);
  // router.get('/api/affectations', checkPermission('ListeAffectation'),getAllAffectations);
  // router.get('/api/affectations/:id', getAffectation);
  // router.delete('/api/affectations/:id', checkPermission('DeleteAffectation'),deleteAffectation);
  // router.put('/api/affectations/:id',checkPermission('EditAffectation'), updateAffectation);
};