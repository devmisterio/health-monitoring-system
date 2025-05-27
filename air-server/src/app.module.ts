import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './config/schema';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerOptions } from '@nestjs/throttler';
import { RespondersModule } from './responders/responders.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('environment') === 'development',
        logging: configService.get<string>('environment') === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService): ThrottlerOptions[] => [
        {
          ttl: configService.get<number>('throttler.ttl') ?? 60000,
          limit: configService.get<number>('throttler.limit') ?? 60,
        },
      ],
      inject: [ConfigService],
    }),

    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),

    RespondersModule,
  ],
})
export class AppModule {}
