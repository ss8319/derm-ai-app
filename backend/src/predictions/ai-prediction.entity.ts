import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Case } from '../cases/case.entity';

@Entity('ai_predictions')
export class AIPrediction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    caseId: string;

    @ManyToOne(() => Case, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'caseId' })
    case: Case;

    @Column()
    predictedCondition: string;

    @Column('float')
    confidence: number;

    @Column({ default: 'v1.0' })
    modelVersion: string;

    @Column({ type: 'simple-json', nullable: true })
    additionalPredictions: Array<{ condition: string; confidence: number }>;

    @CreateDateColumn()
    predictionDate: Date;

    @Column({ type: 'simple-json', nullable: true })
    metadata: Record<string, any>;
}
