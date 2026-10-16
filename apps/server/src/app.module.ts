import { Module } from '@nestjs/common';
import modules from '@src/modules/index.js';

@Module({
  imports: [...modules],
})
export class AppModule {}
