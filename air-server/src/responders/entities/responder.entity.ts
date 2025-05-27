import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('responders')
@Index(['lastSeen'])
@Index(['tenantId', 'isActive'])
export class Responder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  tenantId: string;

  @Column({ type: 'inet' })
  ipAddress: string;

  @Column({ type: 'varchar', length: 100 })
  os: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastSeen: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get isHealthy(): boolean {
    if (!this.isActive || !this.lastSeen) {
      return false;
    }
    const healthyThresholdMs = 60000; // 1 minute
    return Date.now() - this.lastSeen.getTime() < healthyThresholdMs;
  }

  get status(): 'healthy' | 'offline' {
    return this.isHealthy ? 'healthy' : 'offline';
  }
}
