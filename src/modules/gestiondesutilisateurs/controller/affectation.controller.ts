import { Affectation } from "../entity/Affectation"
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { User } from "../entity/user.entity";
// import { Bureau } from "../../gestiondesagences/entity/Bureau";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";


export const createAffectation = async (req: Request, res: Response) => {
    const agent = await myDataSource.getRepository(User).findOne({
        where:{
            id: parseInt(req.body.agent)
        },
        // relations:{
        //     agence:true
        // }
    });
    var ancienneAgence:any = null;

    // if(agent.agence){
    //     // ancienneAgence = await myDataSource.getRepository(Bureau).findOne({
    //     //     where:{
    //     //         id: agent.agence.id
    //     //     },
    //     // });
    //     req.body["ancienneAgence"]=agent.agence.id;
    // }else{
    //     req.body["ancienneAgence"]=null;
    // }
    
    // const affectation = new Affectation();
    // affectation.nouvelleAgence = nouvelleAgence;
    // affectation.ancienneAgence = ancienneAgence;
    // affectation.agent = agent;
    //affectation.dateCreation = new Date();

    // myDataSource.getRepository(Affectation).merge(affectation, {
    //     ancienneAgence: ancienneAgence
    // })
   
    const affectation = myDataSource.getRepository(Affectation).create(req.body);
    const errors = await validate(affectation)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.manager.transaction(async (transactionalEntityManager) => {
        const affectations = await transactionalEntityManager.getRepository(Affectation).save(affectation);
    //     transactionalEntityManager.getRepository(User)
    //     .createQueryBuilder()
    //  //   .update({agence: req.body.nouvelleAgence})
    //     .where("id = :agent", { agent: agent.id })
    //     .execute();
    }).then(affectations => {
        const message = `L'affectation a bien été crée.`;
        return success(res,201, affectation,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette affectation existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette affectation existe déjà.')
        }
        const message = `L'affectation n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllAffectations = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Affectation).find({
        relations: {
            // nouvelleAgence: true,
            // ancienneAgence:true, 
    },
    order: {
        id: "DESC",
    },
})
    .then(affectations => {
        const message = 'La liste des Affectations a bien été récupérée.'
        return success(res,200,affectations, message);
    }).catch(error => {
        const message = `La liste des Affectations n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAffectation = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Affectation).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            // nouvelleAgence: true,
            // ancienneAgence:true,
            // userAgenceCreate:true,
            agent:true
    },
    })
    .then(affectation => {
        if(affectation === null) {
          const message = `L'affectation demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le Affectation a bien été trouvé.`
        return success(res,200, affectation,message);
    })
    .catch(error => {
        const message = `Le Affectation n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateAffectation = async (req: Request, res: Response) => {
    const affectation = await myDataSource.getRepository(Affectation).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            // nouvelleAgence: true,
            // ancienneAgence:true,
           // userAgenceCreate:true,
            agent:true
    },
    }
    )
    if (!affectation) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce Affectation existe déjà')
    }
    myDataSource.getRepository(Affectation).merge(affectation,req.body);
    const errors = await validate(affectation);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Affectation).save(affectation).then(affectation => {
        const message = `Le Affectation ${affectation.id} a bien été modifié.`
        return success(res,200, Affectation,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce Affectation existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce Affectation existe déjà')
        }
        const message = `Le Affectation n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

  
export const deleteAffectation = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Affectation', parseInt(req.params.id));
    await myDataSource.getRepository(Affectation).findOneBy({id: parseInt(req.params.id)}).then(affectation => {        
        if(affectation === null) {
          const message = `Le Affectation demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        if(resultat){
            const message = `Ce affectation est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce affectation est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Affectation).softRemove(affectation)
            .then(_ => {
                const message = `Le Affectation avec l'identifiant n°${affectation.id} a bien été supprimé.`;
                return success(res,200, affectation,message);
            })
        }
    }).catch(error => {
        const message = `Le Affectation n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
