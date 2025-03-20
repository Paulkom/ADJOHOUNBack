import { Request, Response } from "express";
import { User } from '../entity/user.entity';
import bcryptjs = require('bcryptjs');
import { myDataSource } from '../../../configs/data-source';
import { generateServerErrorCode, success, validateMessage } from '../../../configs/response';
import { ValidationError, validate } from 'class-validator';
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";

export const createUser = async (req: Request, res: Response) => {
  req.body.telephone = req.body.telephone.replace(/\s/g, '');
  const user = myDataSource.getRepository(User).create(req.body);
  const errors = await validate(user)
  if (errors.length > 0) {
      const message = validateMessage(errors);
      return generateServerErrorCode(res,400,errors,message)
  }
  await myDataSource.getRepository(User).save(user)
  .then(user => {
      const message = `L'utilisateur ${req.body.nomComplet} a bien été crée.`
      return success(res,201, user,message);
  })
  .catch(error => {
      if(error instanceof ValidationError) {
          return generateServerErrorCode(res,400,error,'Cette user existe déjà')
      }
      if(error.code == "ER_DUP_ENTRY") {
          return generateServerErrorCode(res,400,error,'Cette user existe déjà')
      }
      const message = `L'utilisacteur n'a pas pu être ajouté. Réessayez dans quelques instants.`
      return generateServerErrorCode(res,500,error,message)
  })
}


export const getAllUsers = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, User);
    let reque = await myDataSource.getRepository(User)
        //   .find({
        //     relations:{
        //         agence:true,
        //         affectation: true,
        //         role: true,
        //     }
        //   })
        .createQueryBuilder('user')
       // .leftJoinAndSelect("user.agence","Bureau")
        .leftJoinAndSelect("user.affectation","affectation")
        .leftJoinAndSelect("user.role","Role")
        .where("user.deletedAt IS NULL");
        if (searchQueries.length > 0) {
            reque.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }));
        }
    reque.skip(startIndex)
        .take(limit)
        .getManyAndCount()
  .then(([data, totalElements]) => {
      const message = 'La liste des utilisateurs a bien été récupéré.';
      const totalPages = Math.ceil(totalElements / limit);
      return success(res,200,{data, totalPages, totalElements, limit}, message);
  }).catch(error => {
      const message = `La liste des utilisateurs n'a pas pu être récupéré. Réessayez dans quelques instants.`
      ////res.status(500).json({ message, data: error })
      return generateServerErrorCode(res,500,error,message)
  })
};

export const getUser = async (req: Request, res: Response) => {
  await myDataSource.getRepository(User).findOne({
    where:{
        id: parseInt(req.params.id)
    },
    relations:{
       // agence:true,
        affectation: true,
        role: true,
    }
  }).then(user => {
      if(user === null) {
        const message = `L'utilisateur demandé n'existe pas. Réessayez avec un autre identifiant.`
        return generateServerErrorCode(res,400,"L'id n'existe pas",message)
      }
      const message = "L'utilisateur a bien été trouvé."
      return success(res,200, user,message);
    })
    .catch(error => {
      const message = `L'utilisateur n'a pas pu être récupéré. Réessayez dans quelques instants.`
      return generateServerErrorCode(res,500,error,message)
  })
};

export const updateUser = async (req: Request, res: Response) => {
  var user = await myDataSource.getRepository(User).findOne({
    where:{
        id: parseInt(req.params.id)
    },
    // relations:{
    //     role: true,
    // }
  })
  if (!user) {
      return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce rôle existe déjà')
  }
  user = myDataSource.getRepository(User).merge(user,req.body);
  const errors = await validate(user)
  if (errors.length > 0) {
      const message = validateMessage(errors);
      return generateServerErrorCode(res,400,errors,message)
  }
  await myDataSource.getRepository(User).save(user)
  .then(user => {
      const message = `L'utilisateur ${req.body.nomComplet} a bien été modifié.`
      return success(res,200, user,message);
  })
  .catch(error => {
      if(error instanceof ValidationError) {
          return generateServerErrorCode(res,400,error,'Ce utilisateur existe déjà')
      }
      if(error.code == "ER_DUP_ENTRY") {
          return generateServerErrorCode(res,400,error,'Ce utilisateur existe déjà')
      }
      const message = `L'utilisateur n'a pas pu être ajouté. Réessayez dans quelques instants.`
      return generateServerErrorCode(res,500,error,message)
      // res.status(500).json({ message, data: error }) 
  })
}

export const updatePassword = async (req: Request, res: Response) => {
    /**
     * Modification de mot de passe 
     * {
     * password 
     * newPassword
     * }
     */
    const utilisateur = await myDataSource.getRepository(User) //bcryptjs
    .createQueryBuilder("u")
    .where("id = :identifiant", { identifiant: req.params.id })
    .getOne();

    if (!await bcryptjs.compare(req.body.password, utilisateur.password)) {
        return generateServerErrorCode(res,400,'Invalid Credentials',"Ancien mot de passe est incorrecte");
    }
   await myDataSource.getRepository(User) //bcryptjs
  .createQueryBuilder("u")
  .update({password:await bcryptjs.hash(req.body.newPassword, 12)})
  .where("id = :identifiant", { identifiant: req.params.id })
  .execute()  
  .then(user => {
        const message = `La modification du mot de passe s'est bien passée.`
        return success(res,200, user,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce utilisateur existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce utilisateur existe déjà')
        }
        const message = `L'utilisateur n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    });
}

export const ChangerPasswordAdmin = async (req: Request, res: Response) => {
await myDataSource.getRepository(User) 
  .createQueryBuilder("u")
  .update({password:await bcryptjs.hash(req.body.newPassword,12)})
  .where("id = :identifiant", { identifiant: req.params.id })
  .execute()  
  .then(user => {
        const message = `La modification du mot de passe s'est bien passée.`
        return success(res,200, user,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce utilisateur existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce utilisateur existe déjà')
        }
        const message = `L'utilisateur n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    });
}

export const deleteUser = async (req: Request, res: Response) => {
  const resultat = await checkRelationsOneToMany('User', parseInt(req.params.id));
  await myDataSource.getRepository(User).findOneBy({id: parseInt(req.params.id)}).then(user => {        
      if(user === null) {
        const message = `L'utilisateur demandé n'existe pas. Réessayez avec un autre identifiant.`
        return generateServerErrorCode(res,400,"L'id n'existe pas",message);
      }
      if(resultat){
        const message = `Ce utilisateur est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
        return generateServerErrorCode(res,400,"Ce utilisateur est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
      }else{
        myDataSource.getRepository(User).softRemove(user)
        .then(_ => {
            const message = `L'utilisateur avec l'identifiant n°${user.id} a bien été supprimé.`;
            return success(res,200, user,message);
        })
      }
  })
  .catch(error => {
      const message = `L'utilisateur n'a pas pu être supprimé. Réessayez dans quelques instants.`
      return generateServerErrorCode(res,500,error,message)
  })

  
}



  