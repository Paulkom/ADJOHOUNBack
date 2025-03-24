import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";
import { Arrondissement } from "./Arrondissement";

@Entity()
export class Commune{
    @PrimaryGeneratedColumn()
    
    id:number

    @Column({unique:true})
    @IsNotEmpty({message:"Le libellé ne peut pas être null"})
    libelle:string

    @Column({unique:true})
    @IsNotEmpty({message:"Le code ne peut pas être null"})
    code:string

    @OneToMany(()=> Arrondissement, (arrondissement)=>arrondissement.commune)
    arrondissements:Arrondissement[]
    
    @ManyToOne(()=>User)
    userCreation:User

    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}