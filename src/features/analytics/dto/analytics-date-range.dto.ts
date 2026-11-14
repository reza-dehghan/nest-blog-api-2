
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class AnalyticsDateRangeDto {
  @ApiPropertyOptional({
    description: 'Start date of the analytics date range (ISO 8601 format)',
    example: '2026-10-01',
    type: String,
  })
  @IsOptional()
  @IsDateString({ strict: true })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date of the analytics date range (ISO 8601 format)',
    example: '2026-10-25',
    type: String,
  })
  @IsOptional()
  @IsDateString({ strict: true })
  endDate?: string;
}
