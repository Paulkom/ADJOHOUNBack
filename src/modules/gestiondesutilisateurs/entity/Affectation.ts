import { Entity, PrimaryGeneratedColumn,ManyToOne, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Timestamp } from "typeorm"
import { RolePermission } from "./RolePermission.entity"
import { User } from "./user.entity"
import { IsNotEmpty } from "class-validator"
// import {Bureau} from "../../gestiondesagences/entity/Bureau"

@Entity()
export class Affectation {
    @PrimaryGeneratedColumn()
    id: number

//     @ManyToOne(()=>Bureau)
//    //@IsNotEmpty({ message: "L'ancienne agence est obligatoire." })
//     ancienneAgence: Bureau

//     @ManyToOne(()=>Bureau)
//     @IsNotEmpty({ message: 'La nouvelle agence est obligatoire.' })
//     nouvelleAgence: Bureau

    @Column()
    dateCreation:Date

    @ManyToOne(()=>User)
    userAgenceCreate:User

    @ManyToOne(()=>User)
    agent:User

    @CreateDateColumn()
    createdAt:Timestamp;

    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;

}