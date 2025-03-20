import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne,OneToMany, JoinColumn } from 'typeorm';

@Entity('reclamation')
export class Reclamation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'varchar', length: 255 })
  objet: string;
  

  @Column({ type: 'varchar', length: 255, unique: false })
  email: string;

    @Column({ type: 'varchar', length: 255 ,nullable: true})
  message: string;

   @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


}
