import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Responder } from './entities/responder.entity';
import {
  RegisterResponderDto,
  DeregisterResponderDto,
  HealthUpdateDto,
  ResponderResponseDto,
  AdminStatsResponseDto,
} from './dto/responder.dto';
import { BatchHealthQueueService } from './queue';

@Injectable()
export class RespondersService {
  private readonly logger = new Logger(RespondersService.name);

  constructor(
    @InjectRepository(Responder)
    private readonly responderRepository: Repository<Responder>,
    private readonly batchHealthQueueService: BatchHealthQueueService,
  ) {}

  async register(dto: RegisterResponderDto): Promise<ResponderResponseDto> {
    // Simple token validation for this assignment
    const tenantId = this.validateTokenAndExtractTenant(dto.token);

    const responder = this.responderRepository.create({
      tenantId,
      ipAddress: dto.ipAddress,
      os: dto.os,
      token: dto.token,
      lastSeen: new Date(),
      isActive: true,
    });

    const saved = await this.responderRepository.save(responder);
    this.logger.log(`Responder registered: ${saved.id} for tenant ${tenantId}`);
    return this.mapToResponseDto(saved);
  }

  async deregister(dto: DeregisterResponderDto): Promise<void> {
    const result = await this.responderRepository.update(
      {
        id: dto.responderId,
        token: dto.token,
        isActive: true
      },
      {
        isActive: false
      }
    );

    if (result.affected === 0) {
      throw new NotFoundException('Responder not found or invalid token');
    }

    this.logger.log(`Responder deregistered: ${dto.responderId}`);
  }

  async updateHealth(
    dto: HealthUpdateDto,
    requestId?: string,
  ): Promise<{ jobId: string }> {
    const jobId = await this.batchHealthQueueService.addHealthUpdate(
      dto,
      requestId,
    );

    return { jobId };
  }

  async findAll(tenantId?: string, page?: number, limit?: number): Promise<{
    responders: ResponderResponseDto[];
    total: number;
    hasMore: boolean;
  }> {
    const queryBuilder = this.responderRepository
      .createQueryBuilder('responder')
      .where('responder.isActive = :isActive', { isActive: true });

    if (tenantId) {
      queryBuilder.andWhere('responder.tenantId = :tenantId', { tenantId });
    }

    // If no pagination params, return all
    if (page === undefined || limit === undefined) {
      const responders = await queryBuilder
        .orderBy('responder.lastSeen', 'DESC')
        .getMany();

      return {
        responders: responders.map((responder) => this.mapToResponseDto(responder)),
        total: responders.length,
        hasMore: false,
      };
    }

    // Paginated query for scalability
    const offset = (page - 1) * limit;

    const [responders, total] = await queryBuilder
      .orderBy('responder.lastSeen', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      responders: responders.map((responder) => this.mapToResponseDto(responder)),
      total,
      hasMore: offset + responders.length < total,
    };
  }

  async findOne(id: string): Promise<ResponderResponseDto> {
    const responder = await this.responderRepository.findOne({
      where: { id, isActive: true },
    });

    if (!responder) {
      throw new NotFoundException('Responder not found');
    }

    return this.mapToResponseDto(responder);
  }

  async getAdminStats(): Promise<AdminStatsResponseDto> {
    // Get distinct tenant count
    const tenantCount = (await this.responderRepository
      .createQueryBuilder('responder')
      .select('COUNT(DISTINCT responder.tenantId)', 'count')
      .where('responder.isActive = :isActive', { isActive: true })
      .getRawOne()) as { count: string };

    // Get total responders count
    const totalResponders = await this.responderRepository.count({
      where: { isActive: true },
    });

    // Get all active responders to calculate health
    const responders = await this.responderRepository.find({
      where: { isActive: true },
    });

    const healthyResponders = responders.filter((r) => r.isHealthy).length;
    const offlineResponders = totalResponders - healthyResponders;
    const healthyPercentage =
      totalResponders > 0
        ? Math.round((healthyResponders / totalResponders) * 100)
        : 0;

    return {
      totalTenants: parseInt(tenantCount.count, 10) || 0,
      totalResponders,
      healthyResponders,
      offlineResponders,
      healthyPercentage,
    };
  }


  private mapToResponseDto(responder: Responder): ResponderResponseDto {
    return {
      id: responder.id,
      tenantId: responder.tenantId,
      ipAddress: responder.ipAddress,
      os: responder.os,
      lastSeen: responder.lastSeen,
      isActive: responder.isActive,
      status: responder.status,
      createdAt: responder.createdAt,
      updatedAt: responder.updatedAt,
    };
  }

  /**
   * Simple token validation for assignment purposes
   * Expected token format: "tenant-{tenantId}" (e.g., "tenant-123", "tenant-companyA")
   * Note: This is a basic validation system designed for this assignment
   * @param token - Token string in format "tenant-{tenantId}"
   * @returns tenantId - The extracted tenant identifier
   */
  private validateTokenAndExtractTenant(token: string): string {
    if (!token || token.length < 8 || !token.startsWith('tenant-')) {
      throw new UnauthorizedException('Invalid token');
    }

    const parts = token.split('-');
    if (parts.length < 2) {
      throw new UnauthorizedException('Invalid token format');
    }

    return parts[1];
  }
}
