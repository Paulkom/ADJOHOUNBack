import { ValidationError, isArray, validate } from "class-validator";
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response"
import { Brackets } from "typeorm";
import { Response, Request } from "express";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Usager } from "../entity/usager.entity";
import { Media } from "../entity/media.entity";

const usagerRepository = myDataSource.getRepository(Usager);


export const createUsager = async (req: Request, res: Response) => {
    try {
        //
        const lesFichiers = req["files"];
        const photo = (lesFichiers["urlImage"] && lesFichiers["urlImage"].length > 0) ? lesFichiers["urlImage"][0] : null;
        const lesAutres = (lesFichiers["autreFichier[]"] && lesFichiers["autreFichier[]"].length > 0) ? lesFichiers["autreFichier[]"] : [];
        var laPhoto = new Media();
        console.log(req["files"]);
        //return ;
        console.log("1")
        var existUsager = myDataSource.getRepository(Usager).createQueryBuilder("us")
            .where("(us.nom = :nom AND us.prenom = :prenom AND us.email = :email AND us.numtel = :numtel )", { nom: req.body.nom, prenom: req.body.prenom, email: req.body.email, numtel: req.body.numtel })
        if (req.body.npi && req.body.npi != "") {
            existUsager = existUsager.orWhere("us.npi = :npi", { npi: req.body.npi })
        }
        if (req.body.ifu && req.body.ifu != "") {
            existUsager = existUsager.orWhere("us.ifu = :ifu", { ifu: req.body.ifu })
        }
        const refff = await existUsager.getMany();
        console.log(" refff ===> ", refff);
        if (refff && refff.length > 0) {
            const errorMessage = "Un marchand portant ces informations ou cet ifu ou ce npi existe déjà";
            return generateServerErrorCode(res, 400, { message: errorMessage }, errorMessage);
        }
        const usager = myDataSource.getRepository(Usager).create(req.body);
        const errors = await validate(usager);
        if (errors.length > 0) {
            const message = "Validation échouée.";
            return generateServerErrorCode(res, 400, errors, message);
        }
        const usag = await myDataSource.getRepository(Usager).save(usager);
        if (photo) {
            const photoExtension = photo.originalname.split('.').pop().toLowerCase();
            const pho = new Media();
            pho.usager = isArray(usag) ? usag[0] : (usag as Usager);
            pho.nomMedia = photo.originalname;
            pho.typeMedia = "Photo";
            pho.extension = photoExtension;
            pho.cheminMedia = photo.path;
            await myDataSource.getRepository(Media).save(pho);
        }
        if (lesAutres && lesAutres.length > 0) {
            const lesMedias: Media[] = [];
            for (let fil of lesAutres) {
                const fileExtension = fil.originalname.split('.').pop().toLowerCase();
                const media = new Media();
                media.usager = isArray(usag) ? usag[0] : (usag as Usager);
                media.nomMedia = fil.originalname;
                media.typeMedia = "Autre";
                media.extension = fileExtension;
                media.cheminMedia = fil.path;
                lesMedias.push(media);
            }
            await myDataSource.getRepository(Media).save(lesMedias);
        }
        const message = `Usager ${req.body.nom} a bien été crée.`;
        return success(res, 201, usager, message);
    } catch (error: any) {
        console.log("Erreur ==> ", error)
        if (error.code === "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, "Usager existe déjà.");
        }
        const message = "Une erreur est survenue lors de l'ajout de l'usager.";
        return generateServerErrorCode(res, 500, error, message);
    }
};

/*export const createUsager = async (req: Request, res: Response) => {
    const usager = myDataSource.getRepository(Usager).create(req.body);
    const errors = await validate(usager)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Usager).save(usager)
    .then(usager => {
        const message = `Usager ${req.body.nom} a bien été crée.`;
        return success(res,201, usager,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce marchand existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce marchand existe déjà')
        }
        const message = `Ce marchand n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
   
};*/

export const getUsagerBykey = async (req: Request, res: Response) => {
    const IdUsagerExclude = req.query.usagerSelected;
    let reque = await myDataSource.getRepository(Usager)
        .createQueryBuilder("a")
        .select("a")
        .where("(a.nom like :key1 OR a.prenom like :key1)", { key1: `%${req.params.cle}%` });
    if (IdUsagerExclude != '' && IdUsagerExclude != null) {
        reque.andWhere("a.id != :excludeId", { excludeId: IdUsagerExclude })
    }
    reque.getMany()
        .then(usagers => {
            if (usagers === null) {
                const message = `Aucun élément ne correspond à votre recherche.`
                return generateServerErrorCode(res, 400, "Aucun élément ne correspond à votre recherche", message)
            }
            const message = `La récupération a bien été exécuté.`
            return success(res, 200, usagers, message);
        })
        .catch(error => {
            const message = `Le marchand n'a pas pu être récupéré. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
};

export const getAllUsager = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Usager).find({
    })
        .then((data) => {
            const message = 'La liste des marchands a bien été récupérée.';
            return success(res, 200, { data }, message);
        }).catch(error => {
            const message = `La liste des marchands n'a pas pu être récupérée. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
};



export const getUsagerByNpi = async (req: Request, res: Response) => {
    try {
        const { npi } = req.params;
        const usager = await myDataSource.getRepository(Usager)
        .createQueryBuilder("usager")
        .where("usager.npi = :npi", { npi })
        .andWhere("usager.npi IS NOT NULL")
        .getOne();

        if (!usager) {
            const message = `Aucun usager trouvé avec le NPI fourni.`;
            return generateServerErrorCode(res, 404, "NPI introuvable", message);
        }

        const message = `Usager trouvé avec succès.`;
        return success(res, 200, usager, message);
    } catch (error) {
        const message = `Une erreur est survenue lors de la recherche de l'usager par NPI.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};
export const getAllUsagers = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Usager);
    try {
        const [data, totalElements] = await myDataSource.getRepository(Usager)
            .createQueryBuilder('usager')
            .where("usager.deletedAt IS NULL")
            .andWhere(searchQueries.length > 0 ? new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }) : '1=1')
            .skip(startIndex)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(totalElements / limit);
        const message = 'La liste des marchands a bien été récupérée.';
        return success(res, 200, { data, totalPages, totalElements, limit }, message);
    } catch (error) {
        const message = `La liste des marchands n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};
export const getUsager = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Usager).findOne({
        where: { id: parseInt(req.params.id) },
        relations: ["medias"],
    })
        .then(usager => {
            if (usager === null) {
                const message = `Marchand n'existe pas. Réessayez avec un autre identifiant.`
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message)
            }
            const message = `Marchand  a bien été trouvé.`
            return success(res, 200, usager, message);
        })
        .catch(error => {
            const message = `Le marchand n'a pas pu être récupéré. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
};

export const updateUsager = async (req: Request, res: Response) => {
    try {
        const usagerRepository = myDataSource.getRepository(Usager);
        const mediaRepository = myDataSource.getRepository(Media);
        var existUsager = myDataSource.getRepository(Usager).createQueryBuilder("us")
            .andWhere("(us.nom = :nom AND us.prenom = :prenom AND us.email = :email AND us.numtel = :numtel AND us.id != :id )", { id: parseInt(req.params.id), nom: req.body.nom, prenom: req.body.prenom, email: req.body.email, numtel: req.body.numtel })
        if (req.body.npi && req.body.npi != "") {
            existUsager = existUsager.orWhere("(us.npi = :npi AND us.id != :id )", { npi: req.body.npi, id: parseInt(req.params.id) })
        }
        if (req.body.ifu && req.body.ifu != "") {
            existUsager = existUsager.orWhere("(us.ifu = :ifu AND us.id != :id)", { ifu: req.body.ifu, id: parseInt(req.params.id) })
        }
        const refff = await existUsager.getMany();
        console.log("Existant ===> ", refff)
        if (refff && refff.length > 0) {
            const errorMessage = "Un autre marchand porte déjà ces informations ou cet ifu ou ce npi existe déjà";
            return generateServerErrorCode(res, 400, { message: errorMessage }, errorMessage);
        }
        const usager = await usagerRepository.findOne({
            where: { id: parseInt(req.params.id) },
            select: ['id', 'nom', 'prenom', 'email', 'sexe', 'adresse', 'ifu', 'npi', 'numtel']
        });
        console.log("Usager trouvé rrr : ==> ", usager);

        if (!usager) {
            return generateServerErrorCode(res, 404, "Usager introuvable", "L'usager avec cet ID n'existe pas.");
        }

        const lesFichiers = req["files"] || {};

        const nouvellePhoto = lesFichiers["urlImage"]?.[0] || null;
        const nouveauxAutresFichiers = lesFichiers["autreFichier[]"] || [];

        const usag = usagerRepository.merge(usager, req.body);

        const errors = await validate(usager);
        if (errors.length > 0) {
            const message = "Validation échouée.";
            return generateServerErrorCode(res, 400, errors, message);
        }

        // Suppression des anciens fichiers uniquement si de nouveaux sont envoyés
        if (nouvellePhoto || nouveauxAutresFichiers.length > 0) {
            await mediaRepository.softRemove({ usager: { id: usager.id } });
            console.log("Anciennes images supprimées.");
        }

        // Enregistrement de la nouvelle photo
        if (nouvellePhoto) {
            console.log("Ajout de la nouvelle photo...");
            const photoExtension = nouvellePhoto.originalname.split('.').pop().toLowerCase();
            const newPhoto = new Media();
            newPhoto.usager = usager;
            newPhoto.nomMedia = nouvellePhoto.originalname;
            newPhoto.typeMedia = "Photo";
            newPhoto.extension = photoExtension;
            newPhoto.cheminMedia = nouvellePhoto.path;
            await mediaRepository.save(newPhoto);
            console.log("Nouvelle photo enregistrée :", newPhoto);
        }

        // Enregistrement des autres fichiers
        if (nouveauxAutresFichiers.length > 0) {
            console.log("Ajout des nouveaux fichiers...");
            const lesMedias: Media[] = nouveauxAutresFichiers.map((fichier) => {
                const fileExtension = fichier.originalname.split('.').pop().toLowerCase();
                const media = new Media();
                media.usager = usager;
                media.nomMedia = fichier.originalname;
                media.typeMedia = "Autre";
                media.extension = fileExtension;
                media.cheminMedia = fichier.path;
                return media;
            });

            await mediaRepository.save(lesMedias);
            console.log("Nouveaux fichiers enregistrés :", lesMedias);
        }

        //Mise à jour de l'usager
        await usagerRepository //bcryptjs
            .createQueryBuilder("u")
            .update({
                ...usag
            })
            .where("id = :identifiant", { identifiant: req.params.id })
            .execute();

        const message = `L'usager ${usager.nom} a bien été modifié avec les nouvelles images.`;
        return success(res, 200, usager, message);
    } catch (error: any) {
        console.error("Erreur lors de la modification de l'usager :", error);

        if (error.code === "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, "Cet usager existe déjà.");
        }

        const message = "Une erreur est survenue lors de la mise à jour de l'usager.";
        return generateServerErrorCode(res, 500, error, message);
    }
};


export const deleteUsager = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Usager)
        .findOne({
            where: {
                id: parseInt(req.params.id)
            }
        })
        .then(usager => {
            if (usager === null) {
                const message = `Marchand n'existe pas. Réessayez avec un autre identifiant.`
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
            }
            else {
                myDataSource.getRepository(Usager).softRemove(usager)
                    .then(_ => {
                        const message = `Le marchand ${usager.nom} a bien été supprimé.`;
                        return success(res, 200, usager, message);
                    })
            }
        }).catch(error => {
            const message = `Marchand n'a pas pu être supprimé. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
}

export const usagerInfo = async (req: Request, res: Response) => {
      try{
        const retour = await myDataSource.getRepository(Usager)
        .createQueryBuilder("u")
        .select("COUNT(u.id) AS nombre")
        .innerJoinAndSelect("u.parcelles","parcelle")
        .getRawOne();

        const usagerNonActif  = await myDataSource.getRepository(Usager)
        .createQueryBuilder("u")
        .select("COUNT(u.id) AS nombre")
        .leftJoinAndSelect("u.parcelles","parcelle")
        .where("parcelle.id IS NULL")
        .getRawOne();
        const message = "Liste des parcelle par statut";
        return success(res, 200, [{statut:"Actif", nombre:retour.nombre},{statut:"Inactif", nombre:usagerNonActif.nombre}], message);
      }catch (error) {
        res.status(500).json({ message: error.message });
      }
    
}