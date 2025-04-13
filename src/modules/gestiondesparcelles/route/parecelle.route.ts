import * as express from 'express';
import { createParcelle, getParcelleById, updateParcelle, deleteParcelle,recupererListeParcelles, parcelleAnne, dixDernieresParcelles, parcelleParStatut, getlesParcelles } from '../controller/parcelle.controller';
import { uploadParcelle } from '../../../configs/uploads';

export  const parcelleRouter =  (router: express.Router) => {
  router.post('/api/enregistrement/parcelles',uploadParcelle.fields([
      { name: "pieceFile", maxCount: 1 },
      { name: "autreFichier[]", maxCount: 500 }
    ]), createParcelle);
  router.post('/api/all/parcelles', getlesParcelles);
  router.get('/api/parcelles/:id', getParcelleById);
  router.delete('/api/parcelles/:id',deleteParcelle);
  router.put('/api/parcelles/:id',uploadParcelle.fields([
    { name: "pieceFile", maxCount: 1 },
    { name: "autreFichier[]", maxCount: 500 }
  ]), updateParcelle);
  router.get('/api/recuperation/parcelle', recupererListeParcelles);
  router.get("/api/statistique/parcelle/an",parcelleAnne)
  router.get('/api/dix/dernieres/parcelles', dixDernieresParcelles);
  router.get("/api/statistiques/parcelle/statut",parcelleParStatut)
};