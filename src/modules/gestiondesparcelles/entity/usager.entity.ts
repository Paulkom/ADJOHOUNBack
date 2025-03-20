import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, BeforeInsert } from 'typeorm';
import { Media } from './media.entity';
import { myDataSource } from '../../../configs/data-source';
import { Parcelle } from './parcelle.entity';


@Entity()
export class Usager {

  // Identifiant unique pour l'entité Usager
  @PrimaryGeneratedColumn()
  id: number;

  // Nom de l'usager
  @Column({ type: 'varchar', length: 255 })
  nom: string;

  // Prénom de l'usager
  @Column({ type: 'varchar', length: 255 })
  prenom: string;

  @Column({ type: 'varchar', length: 255 })
  sexe: string;

  @Column({nullable: true})
  adresse: string;

  // Email de l'usager
  //On va réactiver l'unicité
  @Column({ type: 'varchar', length: 255, unique: false })
  email: string;

  // Numéro de téléphone de l'usager
  @Column({ type: 'varchar', length: 15 })
  numtel: string;

  // Matricule de l'usager
  @Column({ type: 'varchar', length: 255 })
  matricule: string;

  // RPI (Registre des Personnes Indivisibles)
  @Column({ type: 'varchar', length: 255 })
  npi: string;

  // IFU (Identifiant Fiscal Unique)
  @Column({ type: 'varchar', length: 255 })
  ifu: string;

  @OneToMany(() => Media, media => media.usager)
  medias: Media[];

  @OneToMany(() => Parcelle, parcelle => parcelle.proprietaire)
  parcelles: Parcelle[];

  // Date de création de l'usager
  @CreateDateColumn()
  createdAt: Date;

  // Date de suppression (logique de suppression)
  @DeleteDateColumn()
  deletedAt: Date;

  // Date de mise à jour de l'usager
  @UpdateDateColumn()
  updatedAt: Date;
}
