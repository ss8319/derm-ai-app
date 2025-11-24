import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CasesModule } from './cases/cases.module';
import { ResponsesModule } from './responses/responses.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { User } from './users/user.entity';
import { Case } from './cases/case.entity';
import { AIPrediction } from './predictions/ai-prediction.entity';
import { ClinicianResponse } from './responses/clinician-response.entity';
import { InteractionLog } from './interactions/interaction-log.entity';
import { CaseAssignment } from './assignments/case-assignment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
      serveRoot: '/',
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'derm_ai.db',
      entities: [User, Case, AIPrediction, ClinicianResponse, InteractionLog, CaseAssignment],
      synchronize: true, // Set to false in production, use migrations instead
      logging: true,
    }),
    CasesModule,
    AuthModule,
    UsersModule,
    ResponsesModule,
    AssignmentsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
