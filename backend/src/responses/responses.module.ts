import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { ClinicianResponse } from './clinician-response.entity';
import { AssignmentsModule } from '../assignments/assignments.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ClinicianResponse]),
        AssignmentsModule,
    ],
    providers: [ResponsesService],
    controllers: [ResponsesController],
    exports: [ResponsesService],
})
export class ResponsesModule { }
