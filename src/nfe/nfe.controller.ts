import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NfeService } from './nfe.service';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { NFE_REQUEST_SCHEMA, NFE_RESPONSE_SCHEMA } from '../docs/schemas';

@ApiTags('NF-e')
@Controller('nfe')
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}

  @Post()
  @ApiOperation({ summary: 'Emitir NF-e mock compatível com MOC 4.00' })
  @ApiBody({ schema: NFE_REQUEST_SCHEMA })
  @ApiOkResponse({ schema: NFE_RESPONSE_SCHEMA })
  async emit(@Body() data: CreateNfeDto) {
    return await this.nfeService.emitNFe(data);
  }
}
