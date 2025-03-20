import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Arrondissement } from "./Arrondissement";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";
import { Parcelle } from "../../gestiondesparcelles/entity/parcelle.entity";

@Entity()
export class Quartier{
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:false})
    @IsNotEmpty({ message:"Le code est obligatoire" })
    code:string

    @Column({nullable:false })
    @IsNotEmpty({ message:"Le libellé est obligatoire" })
    libelle:string

    @ManyToOne(() => Arrondissement, (arrondissement) => arrondissement.quartiers)
    public arrondissement: Arrondissement

    @OneToMany(()=>Parcelle, parcelle => parcelle.village)
    parcelles:Parcelle[];

    @ManyToOne(()=>User)
    userCreation:User
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
    rapports: any;
}