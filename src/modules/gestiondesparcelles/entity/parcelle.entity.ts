import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm";
import { IsNotEmpty, IsAlphanumeric} from "class-validator";
import { Quartier } from "../../gestiondesagences/entity/Quartier";
import { Usager } from "./usager.entity";

@Entity()
export class Parcelle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty()
    etatParcelle: string; 

    @Column({nullable:false, unique: true })
    numeroDossier: string;

    @Column({ nullable:false,unique: true })
    @IsAlphanumeric()
    numeroEtatDesLieux: string;

    @Column()
    superficieEtatDesLieux: number;

    @Column()
    superficieRecasee: number;

    @Column()
    lotParcelle: string;

    @Column({ nullable:false,unique: true })
    @IsAlphanumeric()
    immatriculationParcelle: string;

    @Column()
    nomProprietaire: string;

    @Column()
    prenomsProprietaire: string;

    @Column()
    cipProprietaire: string;

    @Column({nullable:false, unique: true })
    numeroConvention: string;

    @Column({ unique: true })
    numeroADC: string;

    @ManyToOne(()=> Usager, (usager)=>usager.parcelles)
    proprietaire: Usager;

    @Column()
    numeroTelephoneProprietaire: string;

    @ManyToOne(()=> Quartier, (quartier)=>quartier.parcelles)
    village: Quartier;

    @Column()
    piecesFournies: string;

    @Column()
    dateSignatureConventionADC: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}