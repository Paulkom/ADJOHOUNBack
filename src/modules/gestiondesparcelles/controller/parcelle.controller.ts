import { Request, Response } from 'express';
import { Parcelle } from '../entity/parcelle.entity';
import { myDataSource } from '../../../configs/data-source';
import { generateServerErrorCode, success, validateMessage } from '../../../configs/response';
import { validate, isArray } from 'class-validator';
import { Usager } from '../entity/usager.entity';
import { paginationAndRechercheInit2 } from '../../../configs/paginationAndRechercheInit';

// Créer une nouvelle parcelle
export const createParcelle = async (req: Request, res: Response) => {
  try {
    console.log("TT ==> ", req)
    console.log("EEEEE ===> ", req.body);
    console.log("EEEERRRRR ===> ", req["files"]);
    const parcelle = myDataSource.getRepository(Parcelle).create(req.body);
    if (Array.isArray(parcelle)) {
      throw new Error("Expected a single Parcelle object but received an array.");
    }
    const errors = await validate(parcelle)
    if (errors.length > 0) {
      const message = validateMessage(errors);
      return generateServerErrorCode(res, 400, errors, message)
    }
    var proprio = null;
    var laParcelle = null;

    const propioExist = await myDataSource.getRepository(Usager).findOne({ where: { npi: req.body.cipProprietaire } });


    await myDataSource.manager.transaction(async (transactionalEntityManager) => {
      if (!propioExist) {
        const proprietaire = await transactionalEntityManager.getRepository(Usager).save({
          nom: req.body.nomProprietaire,
          npi: req.body.cipProprietaire ? req.body.cipProprietaire : null,
          prenom: req.body.prenomsProprietaire,
          numtel: req.body.telephoneProprietaire,
        });
        proprio = isArray(proprietaire) ? proprietaire[0] : proprietaire;
      } else {
        proprio = propioExist;
      }

      (parcelle as Parcelle).proprietaire = proprio.id;
      //parcelle.proprietaire = await transactionalEntityManager.getRepository(Usager).findOne({where: {id: proprietaire.id}});
      laParcelle = await transactionalEntityManager.getRepository(Parcelle).save(parcelle);

    })

    //await myDataSource.getRepository(Parcelle).save(parcelle);
    const message = `La parcelle ${req.body.numeroDossier} a bien été créée.`
    return success(res, 201, laParcelle, message);
  } catch (error) {
    console.log("Erreur ===> ", error);
    res.status(400).json({ message: error.message });
  }
};

export const getlesParcelles = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit2(req, Parcelle);
    try {
        var reque = await myDataSource.getRepository(Parcelle)
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.proprietaire',"proprietaire")
            .leftJoinAndSelect("p.village","village")
            .leftJoinAndSelect("village.arrondissement","arrondissement")
            .leftJoinAndSelect("arrondissement.commune","commune")
            .where("p.deletedAt IS NULL");

            if (req.body.motCle && req.body.motCle !== '') {
              const motCle = req.body.motCle as string || '';
              reque = reque.where('(p.numeroDossier LIKE :motCle OR p.numeroParcelle LIKE :motCle OR p.superficie LIKE :motCle OR proprietaire.nom LIKE :motCle OR proprietaire.prenom LIKE :motCle OR proprietaire.numtel LIKE :motCle OR proprietaire.email LIKE :motCle OR quartier.libelle LIKE :motCle OR arrondissement.libelle LIKE :motCle OR commune.libelle LIKE :motCle)', { motCle: `%${motCle}%` })
            }

            const [data, totalElements] = await reque
            .skip(startIndex)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(totalElements / limit);
        const message = 'La liste des parcelles a bien été récupérée.';
        return success(res, 200, { data, totalPages, totalElements, limit }, message);
    } catch (error) {
        const message = `La liste des parcelle n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};


export const recupererListeParcelles = async (req: Request, res: Response) => {
  try {
    const parcelles = await myDataSource.getRepository(Parcelle).find({
      relations: {
        village: {
          arrondissement: true,
        },
        proprietaire: true,
      }
    });
    const message = 'Liste des parcelles';
    return success(res, 200, parcelles, message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getParcelleById = async (req: Request, res: Response) => {
  await myDataSource.getRepository(Parcelle).findOne({
      where: { id: parseInt(req.params.id) },
      relations: {
        village:{
          arrondissement:{
            commune:true
          }
        },
        proprietaire:true
      },
  })
      .then(parcelle => {
          if (parcelle === null) {
              const message = `Cette parecelle n'existe pas. Réessayez avec un autre identifiant.`
              return generateServerErrorCode(res, 400, "L'id n'existe pas", message)
          }
          const message = `Parcelle bien récupérée.`
          return success(res, 200, parcelle, message);
      })
      .catch(error => {
          const message = `La parcelle n'a pas pu être récupérée. Réessayez dans quelques instants.`
          return generateServerErrorCode(res, 500, error, message)
      })
};

// Mettre à jour une parcelle par ID
export const updateParcelle = async (req: Request, res: Response) => {
  try {
    const parcelleRepository = myDataSource.getRepository(Parcelle);
    const parcelle = await parcelleRepository.findOneBy({ id: parseInt(req.params.id) });


    if (!parcelle) {
      return res.status(404).json({ message: 'Parcelle non trouvée' });
    }

    var proprio = null;
    var laParcelle = null;

    const propioExist = await myDataSource.getRepository(Usager).findOne({ where: { npi: req.body.cipProprietaire } });

    if (!propioExist) {
      const proprietaire = await myDataSource.getRepository(Usager).save({
        nom: req.body.nomProprietaire,
        npi: req.body.cipProprietaire ? req.body.cipProprietaire : null,
        prenom: req.body.prenomsProprietaire,
        numtel: req.body.telephoneProprietaire,
      });
      proprio = isArray(proprietaire) ? proprietaire[0] : proprietaire;
    } else {
      proprio = propioExist;
    }

    req.body["proprietaire"] = proprio;

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

export const parcelleAnne = async (req: Request, res: Response) => {
  try {
    const retour = await myDataSource.getRepository(Parcelle)
      .createQueryBuilder("p")
      .select("YEAR(p.createdAt) AS annnee, COUNT(p.id) AS nombre")
      .groupBy("YEAR(p.createdAt)")
      .getRawMany();
    const message = "Liste des parcelle par an";
    return success(res, 200, retour, message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const dixDernieresParcelles = async (req: Request, res: Response) => {
  try {
    const retour = await myDataSource.getRepository(Parcelle)
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.village", "village")
      .leftJoinAndSelect("village.arrondissement", "arrondissement")
      .leftJoinAndSelect("p.proprietaire", "proprietaire")
      .orderBy("p.id", "DESC")
      .limit(10)
      .getMany();
    const message = "Liste des dix dernières parcelles";
    return success(res, 200, retour, message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const parcelleParStatut = async (req: Request, res: Response) => {
  try {
    const retour = await myDataSource.getRepository(Parcelle)
      .createQueryBuilder("p")
      .select("p.etatParcelle AS statut, COUNT(p.id) AS nombre")
      .groupBy("p.etatParcelle")
      .getRawMany();
    const message = "Liste des parcelle par statut";
    return success(res, 200, retour, message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}