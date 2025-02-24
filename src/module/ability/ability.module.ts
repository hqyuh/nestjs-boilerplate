import { Module } from '@nestjs/common';

import { AbilityFactory } from './ability.factory';

@Module({
  imports: [],
  exports: [AbilityFactory],
  providers: [AbilityFactory],
})
export class AbilityModule {}
