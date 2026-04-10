import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly service: CategoryService) { }

  @Post()
  create(@Body() dto: CreateCategoryDto, @GetUser('companyId') companyId: string) {
    return this.service.create(dto, companyId);
  }

  @Get()
  findAll(
    @GetUser('companyId') companyId: string,
    @Query('type') type?: string,
  ) {
    return this.service.findAll(companyId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('companyId') companyId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category id');
    }

    return this.service.findOne(id, companyId);
  }

  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @GetUser('companyId') companyId: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category id');
    }

    return this.service.update(id, dto, companyId);
  }
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('companyId') companyId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category id');
    }

    return this.service.remove(id, companyId);
  }
}
