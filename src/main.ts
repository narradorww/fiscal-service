import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Fiscal Service')
    .setDescription('Microserviço para emissão simulada de NF-e e CT-e (MOC 4.00).')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
  });
  await app.listen(3000);
  console.log('Fiscal service running on http://localhost:3000');
}
bootstrap();
