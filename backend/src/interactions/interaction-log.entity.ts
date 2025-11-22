import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('interaction_logs')
export class InteractionLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'uuid', nullable: true })
    caseId: string;

    @Column()
    actionType: string; // 'view_case', 'view_ai', 'submit_diagnosis', 'toggle_ai', etc.

    @CreateDateColumn()
    timestamp: Date;

    @Column({ type: 'simple-json', nullable: true })
    metadata: Record<string, any>;

    @Column({ type: 'uuid', nullable: true })
    sessionId: string;
}
