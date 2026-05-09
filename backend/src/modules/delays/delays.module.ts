import { Module } from '@nestjs/common';
import { DelaysController } from './delays.controller';
import { DelaysService } from './delays.service';

@Module({
  controllers: [DelaysController],
  providers: [DelaysService],
  exports: [DelaysService],
})
export class DelaysModule {}