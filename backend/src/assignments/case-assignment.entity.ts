import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Case } from '../cases/case.entity';
import { User } from '../users/user.entity';

@Entity('case_assignments')
export class CaseAssignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    caseId: string;

    @ManyToOne(() => Case, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'caseId' })
    case: Case;

    @Column()
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ default: 'pending' })
    status: string; // 'pending' | 'in_progress' | 'completed'

    @CreateDateColumn()
    assignedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    completedAt: Date;
}
