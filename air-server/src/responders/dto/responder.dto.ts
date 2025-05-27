import {
  IsNotEmpty,
  IsString,
  IsIP,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';

// Registration DTO
export class RegisterResponderDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsIP()
  ipAddress: string;

  @IsNotEmpty()
  @IsString()
  os: string;
}

// Deregistration DTO
export class DeregisterResponderDto {
  @IsNotEmpty()
  @IsUUID()
  responderId: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}

// Health Update DTO
export class HealthUpdateDto {
  @IsNotEmpty()
  @IsUUID()
  responderId: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

// Response DTOs
export class ResponderResponseDto {
  id: string;
  tenantId: string;
  ipAddress: string;
  os: string;
  lastSeen: Date;
  isActive: boolean;
  status: 'healthy' | 'offline';
  createdAt: Date;
  updatedAt: Date;
}

export class AdminStatsResponseDto {
  totalTenants: number;
  totalResponders: number;
  healthyResponders: number;
  offlineResponders: number;
  healthyPercentage: number;
}
