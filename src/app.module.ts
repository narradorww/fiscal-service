import { Module } from '@nestjs/common';
import { NfeModule } from './nfe/nfe.module';
import { CteModule } from './cte/cte.module';
import { CertificateModule } from './certificate/certificate.module';

@Module({
  imports: [NfeModule, CteModule, CertificateModule],
})
export class AppModule {}
