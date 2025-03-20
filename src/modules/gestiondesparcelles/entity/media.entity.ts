import { IsAlpha, IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Usager } from './usager.entity';
@Entity('media')
export class Media{
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:true})
    photo:string

    @Column({nullable:true})
    nomMedia:string

    @Column({nullable:true})
    cheminMedia:string
    
    @Column({nullable:true})
    numMedia:string

    @Column({nullable:true})
    typeMedia:string

    @Column({nullable:false})
    extension:string

    @Column({nullable:true})
    idtable:number

    @Column({nullable:true})
    nomTable:string

    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn({ type: "timestamp" }) 
    deletedAt: Date;

     @ManyToOne(() => Usager, (usager) => usager.medias)
      @JoinColumn({ name: 'usager_id' })
      usager: Usager;  
}