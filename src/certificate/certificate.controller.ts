import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificateService } from './certificate.service';

type UploadedCertificate = {
  originalname: string;
  buffer: Buffer;
};

@ApiTags('Certificados')
@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Carregar certificado A1 (PFX/P12)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo .pfx ou .p12 com certificado A1.',
        },
        password: {
          type: 'string',
          description: 'Senha do certificado (opcional).',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Certificado armazenado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string' },
        path: { type: 'string' },
        password: { type: 'string', nullable: true },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCertificate(
    @UploadedFile() file?: UploadedCertificate,
    @Body('password') password?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo do certificado é obrigatório.');
    }

    if (!file.originalname.endsWith('.pfx') && !file.originalname.endsWith('.p12')) {
      throw new BadRequestException('Apenas arquivos .pfx ou .p12 são aceitos.');
    }

    return this.certificateService.saveCertificate(file.originalname, file.buffer, password);
  }

  @Post('mock')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gerar certificado mockado para testes internos' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', example: 'mock-cert.pfx' },
        path: { type: 'string' },
        password: { type: 'string', example: 'mock-password' },
      },
    },
  })
  async createMock() {
    return this.certificateService.createMockCertificate();
  }
}
