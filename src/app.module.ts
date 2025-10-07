import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { NfeModule } from './nfe/nfe.module';
import { CteModule } from './cte/cte.module';
import { CertificateModule } from './certificate/certificate.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'playground'),
      serveRoot: '/playground',
    }),
    NfeModule,
    CteModule,
    CertificateModule,
  ],
})
export class AppModule {}
