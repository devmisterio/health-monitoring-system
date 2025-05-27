import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RespondersService } from './responders.service';
import {
  RegisterResponderDto,
  DeregisterResponderDto,
  HealthUpdateDto,
  ResponderResponseDto,
  AdminStatsResponseDto,
} from './dto/responder.dto';

@Controller('api')
@UseGuards(ThrottlerGuard)
export class RespondersController {
  constructor(private readonly respondersService: RespondersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterResponderDto,
  ): Promise<ResponderResponseDto> {
    return this.respondersService.register(registerDto);
  }

  @Delete('deregister')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deregister(
    @Body() deregisterDto: DeregisterResponderDto,
  ): Promise<void> {
    await this.respondersService.deregister(deregisterDto);
  }

  @Post('health')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateHealth(
    @Body() healthDto: HealthUpdateDto,
    @Req() req: Request,
  ): Promise<{ jobId: string }> {
    const requestId =
      (req.headers['x-request-id'] as string) ||
      Math.random().toString(36).substring(7);

    return this.respondersService.updateHealth(healthDto, requestId);
  }

  @Get('responders')
  async getResponders(
    @Query('tenantId') tenantId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponderResponseDto[] | {
    responders: ResponderResponseDto[];
    total: number;
    hasMore: boolean;
  }> {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    
    const result = await this.respondersService.findAll(tenantId, pageNum, limitNum);
    
    // For backward compatibility, if no pagination params, return array directly
    if (pageNum === undefined || limitNum === undefined) {
      return result.responders;
    }
    
    return result;
  }

  @Get('responders/:id')
  async getResponder(@Param('id') id: string): Promise<ResponderResponseDto> {
    return this.respondersService.findOne(id);
  }

  @Get('admin/stats')
  async getAdminStats(): Promise<AdminStatsResponseDto> {
    return this.respondersService.getAdminStats();
  }

}
