import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { CaseAssignment } from './case-assignment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CaseAssignment])],
    providers: [AssignmentsService],
    controllers: [AssignmentsController],
    exports: [AssignmentsService],
})
export class AssignmentsModule { }
