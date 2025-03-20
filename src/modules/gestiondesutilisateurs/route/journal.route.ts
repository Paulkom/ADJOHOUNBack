import * as express from 'express';
//import { checkPermission } from '../../../middlewares/auth.middleware';
import { getAllJournalConnexions, getAllJournalOperations } from '../controller/journal.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const journalRoutes =  (router: express.Router) => {
  
  router.get('/api/journalConnexions',checkPermission('JournalConnexion'), getAllJournalConnexions);
  router.get('/api/journalOperations',checkPermission('JournalOperation'), getAllJournalOperations);

};