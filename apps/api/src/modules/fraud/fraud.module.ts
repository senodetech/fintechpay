import { Module } from '@nestjs/common';
import { FraudController } from './fraud.controller';
import { FraudEngineService } from './fraud-engine.service';

@Module({
  controllers: [FraudController],
  providers: [FraudEngineService],
  exports: [FraudEngineService],
})
export class FraudModule {}
