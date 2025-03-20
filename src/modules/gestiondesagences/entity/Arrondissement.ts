import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Quartier } from "./Quartier";
import { Commune } from "./Commune";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";

@Entity()
export class Arrondissement{
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:true})
    @IsNotEmpty({ message:"Le code est obligatoire" })
    code:string

    @Column({nullable:true})
    @IsNotEmpty({ message:"Le libellé est obligatoire" })
    libelle:string

    @OneToMany(()=>Quartier, (quartier)=>quartier.arrondissement)
    quartiers:Quartier[]

    @ManyToOne(() => Commune, (commune) => commune.arrondissements)
    public commune: Commune

    @ManyToOne(()=>User)
    userCreation:User

    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}