import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Timestamp, Unique, OneToMany, BeforeInsert, OneToOne, JoinColumn, ManyToMany } from "typeorm"
import { Role } from "./role.entity"
import bcryptjs = require('bcryptjs');
import {Affectation} from "./Affectation"

import {
    IsEmail,
    IsNotEmpty,
    IsStrongPassword,
} from "class-validator"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty({ message: 'Le nom et prénom est une propriété requise.' })
    nomComplet: string

    @IsNotEmpty({ message: 'Le téléphone est une propriété requise.' })
    @Column({unique: true})
    telephone: string
    

    @Column({nullable:true})
    //@IsNotEmpty({ message: 'Le sexe est une propriété requise.' })
    sexe: string

    @ManyToOne(()=>Affectation)
    affectation:Affectation

    @Column({nullable:true,unique: true})
    @IsEmail({},{ message: "L'adresse email est invalide." })
    email: string;

    @Column()
    numeroNational:string

    // @OneToOne(()=>Abonne, (abonne)=>abonne.user)
    // @JoinColumn()
    // abonne:Abonne

    @Column()
    @IsNotEmpty({ message: "Le mot de passe est une propriété requise." })
    // @IsStrongPassword({minLength: 8,minLowercase: 1,minUppercase: 1,minNumbers: 1,minSymbols: 1},
    // { message:"Utilisez 8 caractères ou plus avec un mélange d'au moins une lettre majuscule, minuscule, de chiffres et de symboles." })
    password: string;

    @ManyToOne(() => Role, (role) => role.users,)
    role: Role
    
    @BeforeInsert()
    async addRef() {
        this.password =  await bcryptjs.hash(this.password, 12);
    }

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @DeleteDateColumn()
    deletedAt:Date;
}