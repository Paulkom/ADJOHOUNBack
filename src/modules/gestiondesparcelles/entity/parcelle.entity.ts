import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, Timestamp } from "typeorm";
import { IsNotEmpty, IsAlphanumeric} from "class-validator";
import { Quartier } from "../../gestiondesagences/entity/Quartier";
import { Usager } from "./usager.entity";

@Entity()
export class Parcelle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty({message:"L'état de la parcelle est obligatoire"})
    etatParcelle: string; 

    @Column({nullable:false})
    @IsNotEmpty({message:"Le type de la parcelle est obligatoire"})
    numeroDossier: string;

    @Column({ nullable:true, default: null })
    superficieADC: string;

    @Column({ nullable:true, unique: true, default: null })
    numeroEtatDesLieux: string;

    @Column({ nullable:true, default: null })
    superficieEtatDesLieux: number;

    @Column({nullable:true, default: null })
    superficieRecasee: number;

    @Column({nullable:true, default: null })
    lotParcelle: string;

    @Column({ nullable:false,default: "" })
    immatriculationParcelle: string;

    @Column({ nullable:false,default: "" })
    nomProprietaire: string;

    @Column({nullable:false,default: "" })
    prenomsProprietaire: string;

    @Column({nullable:false,default: "" })
    cipProprietaire: string;

    @Column({nullable:true, unique: true })
    numeroConvention: string;

    @Column({ unique: true, nullable:true })
    numeroADC: string;

    @ManyToOne(()=> Usager, (usager)=>usager.parcelles)
    proprietaire: Usager;

    @Column({nullable:true,default: "" })
    numeroTelephoneProprietaire: string;

    @ManyToOne(()=> Quartier, (quartier)=>quartier.parcelles)
    village: Quartier;

    @Column({nullable:true,default: "" })
    observation: string;

    @Column({nullable:true,default: null })
    dateSignatureConventionADC: Date;

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}