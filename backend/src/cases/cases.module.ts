import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from './case.entity';
import { AIPrediction } from '../predictions/ai-prediction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Case, AIPrediction])],
  controllers: [CasesController],
  providers: [CasesService],
})
export class CasesModule { }
