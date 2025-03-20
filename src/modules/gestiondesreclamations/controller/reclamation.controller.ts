import { ValidationError, validate } from "class-validator";
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response"
import { Brackets } from "typeorm";
import { Response, Request } from "express";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Reclamation } from "../entity/reclamation.entity";


const reclamationRepository = myDataSource.getRepository(Reclamation);

export const createReclamation = async (req: Request, res: Response) => {
    const reclamation = myDataSource.getRepository(Reclamation).create(req.body);
    const errors = await validate(reclamation)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res, 400, errors, message)
    }
    await myDataSource.getRepository(Reclamation).save(reclamation)
        .then(reclamation => {
            const message = `La reclamation a bien été envoyé.`
            return success(res, 201, reclamation, message);
        })
        .catch(error => {
            if (error instanceof ValidationError) {
                return generateServerErrorCode(res, 400, error, 'Cette reclamation  existe déjà')
            }
            if (error.code == "ER_DUP_ENTRY") {
                return generateServerErrorCode(res, 400, error, 'Cette reclamation existe déjà')
            }
            const message = `Cette reclamation n'a pas pu être ajouté. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })

};

export const getAllReclamation = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Reclamation);
    try {
        console.log("EEE ==> ", searchTerm);
        var reque = myDataSource.getRepository(Reclamation)
            .createQueryBuilder('reclamation')
            .where("reclamation.deletedAt IS NULL")

        if (searchTerm && searchTerm != "") {
            reque = reque.andWhere("(reclamation.nom LIKE :mot OR reclamation.objet LIKE :mot OR reclamation.email LIKE :mot OR reclamation.message LIKE :mot) ", { mot: `%${searchTerm}%` });
        }

        const [data, totalElements] = await reque.skip(startIndex)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(totalElements / limit);
        const message = 'La liste des reclamations a bien été récupérée.';
        return success(res, 200, { data, totalPages, totalElements, limit }, message);
    } catch (error) {
        const message = `La liste des reclamations n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const getAllReclamations = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Reclamation);
    try {
        const [data, totalElements] = await myDataSource.getRepository(Reclamation)
            .createQueryBuilder('reclamation')
            .where("reclamation.deletedAt IS NULL")
            .andWhere(searchQueries.length > 0 ? new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }) : '1=1')
            .skip(startIndex)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(totalElements / limit);
        const message = 'La liste des reclamations a bien été récupérée.';
        return success(res, 200, { data, totalPages, totalElements, limit }, message);
    } catch (error) {
        const message = `La liste des reclamations n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};




export const getReclamation = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Reclamation).findOne({
        where: {
            id: parseInt(req.params.id),
        },
    })
        .then(reclamation => {
            if (reclamation === null) {
                const message = `Le reclamation n'existe pas. Réessayez avec un autre identifiant.`
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message)
            }
            const message = `La reclamation a bien été trouvé.`
            return success(res, 200, reclamation, message);
        })
        .catch(error => {
            const message = `La reclamation n'a pas pu être récupéré. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
};



export const updateReclamation = async (req: Request, res: Response) => {
    const reclamation = await myDataSource.getRepository(Reclamation).findOne(
        {
            where: {
                id: parseInt(req.params.id),
            },
        }
    )
    if (!reclamationRepository) {
        return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Ce marché existe déjà')
    }
    myDataSource.getRepository(Reclamation).merge(reclamation, req.body);
    const errors = await validate(reclamation);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res, 400, errors, message)
    }
    await myDataSource.getRepository(Reclamation).save(reclamation).then(typ => {
        const message = `La reclamation ${reclamation.id} a bien été modifié.`
        return success(res, 200, reclamation, message);
    }).catch(error => {
        if (error instanceof ValidationError) {
            return generateServerErrorCode(res, 400, error, 'Cette reclamation existe déjà')
        }
        if (error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, 'Cette reclamation existe déjà')
        }
        const message = `Cette reclamation  n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res, 500, error, message)
    })
}

export const deleteReclamation = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Reclamation)
        .findOne({
            where: {
                id: parseInt(req.params.id)
            }
        })
        .then(reclamation => {
            if (reclamation === null) {
                const message = `Ce marché n'existe pas. Réessayez avec un autre identifiant.`
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
            }
            else {
                myDataSource.getRepository(Reclamation).softRemove(reclamation)
                    .then(_ => {
                        const message = `La reclamation ${reclamation.id} a bien été supprimé.`;
                        return success(res, 200, reclamation, message);
                    })
            }
        }).catch(error => {
            const message = `La reclamatioon n'a pas pu être supprimé. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
}
