import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OauthModule } from './oauth/oauth.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [UsersModule, AuthModule, OauthModule, InfrastructureModule, TenantsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
