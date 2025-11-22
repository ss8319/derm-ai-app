import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('cases')
export class Case {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    patientId: string;

    @Column()
    age: number;

    @Column()
    gender: string;

    @Column('text')
    clinicalHistory: string;

    @Column({ nullable: true })
    chiefComplaint: string;

    @Column()
    imageUrl: string;

    @Column({ nullable: true })
    dermoscopyUrl: string;

    @Column({ nullable: true })
    groundTruthDiagnosis: string; // Hidden from clinicians

    @Column({ type: 'simple-json', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;
}
