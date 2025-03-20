import { Request, Response } from 'express';
import { Parcelle } from '../entity/parcelle.entity';
import { myDataSource } from '../../../configs/data-source';
import { generateServerErrorCode, success, validateMessage } from '../../../configs/response';
import { validate } from 'class-validator';

// Créer une nouvelle parcelle
export const createParcelle = async (req: Request, res: Response) => {
  try {
    const parcelle = myDataSource.getRepository(Parcelle).create(req.body);
    const errors = await validate(parcelle)
    if (errors.length > 0) {
      const message = validateMessage(errors);
      return generateServerErrorCode(res, 400, errors, message)
    }
    await myDataSource.getRepository(Parcelle).save(parcelle);
    const message = `La parcelle ${req.body.numeroDossier} a bien été créée.`
    return success(res, 201, parcelle, message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lire toutes les parcelles
export const getParcelles = async (req: Request, res: Response) => {
  const page = parseInt(req.body.page as string) || 1;
  const limit = parseInt(req.body.limit as string) || 10;
  const motCle = req.body.motCle as string || '';
  const commune = req.body.commune as number || '';
  const arrondissement = req.body.arrondissement as number || '';
  const quartier = req.body.quartier as number || '';
  try {
    var reque = myDataSource.getRepository(Parcelle)
      .createQueryBuilder('parcelle')
      .leftJoinAndSelect('parcelle.quartier', 'quartier')
      .leftJoinAndSelect('parcelle.propretaire', 'propretaire')
      .leftJoinAndSelect('quartier.arrondissement', 'arrondissement')
      .leftJoinAndSelect('arrondissement.commune', 'commune')

      if(req.body.motCle && req.body.motCle !== ''){
        reque = reque.where('(parcelle.numeroDossier LIKE :motCle OR parcelle.numeroParcelle LIKE :motCle OR parcelle.superficie LIKE :motCle OR parcelle.usager.nom LIKE :motCle OR parcelle.usager.prenom LIKE :motCle OR parcelle.usager.numtel LIKE :motCle OR parcelle.usager.email LIKE :motCle OR quartier.libelle LIKE :motCle OR arrondissement.libelle LIKE :motCle OR commune.libelle LIKE :motCle)', { motCle: `%${motCle}%` })
      }
      const parcelles = await reque.skip((page - 1) * limit).take(limit).getMany();
      const total = await reque.getCount();
    const message = 'Liste des parcelles';
    return success(res, 200, parcelles, message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lire une parcelle par ID
export const getParcelleById = async (req: Request, res: Response) => {
  try {
    const parcelle = await myDataSource.getRepository(Parcelle).findOneBy({ id: parseInt(req.params.id) });
    if (!parcelle) {
      return res.status(404).json({ message: 'Parcelle non trouvée' });
    }
    res.status(200).json(parcelle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une parcelle par ID
export const updateParcelle = async (req: Request, res: Response) => {
  try {
    const parcelleRepository = myDataSource.getRepository(Parcelle);
    const parcelle = await parcelleRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!parcelle) {
      return res.status(404).json({ message: 'Parcelle non trouvée' });
    }
    parcelleRepository.merge(parcelle, req.body);
    const errors = await validate(parcelle);
    if (errors.length > 0) {
      const message = validateMessage(errors);
      return generateServerErrorCode(res, 400, errors, message);
    }
    await parcelleRepository.save(parcelle);
    const message = `La parcelle ${parcelle.id} a bien été mise à jour.`;
    return success(res, 200, parcelle, message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Supprimer une parcelle par ID
export const deleteParcelle = async (req: Request, res: Response) => {
  try {
    const parcelleRepository = myDataSource.getRepository(Parcelle);
    const parcelle = await parcelleRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!parcelle) {
      return res.status(404).json({ message: 'Parcelle non trouvée' });
    }
    await parcelleRepository.softRemove(parcelle);
    
    res.status(200).json({ message: 'Parcelle supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};