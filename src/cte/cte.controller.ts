import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CteService } from './cte.service';
import { CreateCteDto } from './dto/create-cte.dto';
import { CTE_REQUEST_SCHEMA, CTE_RESPONSE_SCHEMA } from '../docs/schemas';

@ApiTags('CT-e')
@Controller('cte')
export class CteController {
  constructor(private readonly cteService: CteService) {}

  @Post()
  @ApiOperation({ summary: 'Emitir CT-e mock compatível com MOC 4.00' })
  @ApiBody({ schema: CTE_REQUEST_SCHEMA })
  @ApiOkResponse({ schema: CTE_RESPONSE_SCHEMA })
  async emit(@Body() data: CreateCteDto) {
    return await this.cteService.emitCTe(data);
  }
}
