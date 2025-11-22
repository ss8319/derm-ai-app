import { IsString, IsInt, IsOptional, IsBoolean, Min, Max, Length } from 'class-validator';

export class CreateClinicianResponseDto {
    @IsString()
    @Length(1, 255)
    diagnosis: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsBoolean()
    aiAssistanceEnabled: boolean;

    @IsInt()
    @Min(0)
    timeSpentSeconds: number;

    @IsString()
    caseId: string;
}
