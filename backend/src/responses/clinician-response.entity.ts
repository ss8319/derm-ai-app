import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Case } from '../cases/case.entity';
import { User } from '../users/user.entity';

@Entity('clinician_responses')
export class ClinicianResponse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    diagnosis: string;

    @Column({ type: 'int', nullable: true })
    rating?: number;

    @Column({ type: 'text', nullable: true })
    comments?: string;

    @Column({ type: 'boolean', default: false })
    aiAssistanceEnabled: boolean;

    @Column({ type: 'int', default: 0 })
    timeSpentSeconds: number;

    @ManyToOne(() => Case, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'caseId' })
    case: Case;

    @Column()
    caseId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
