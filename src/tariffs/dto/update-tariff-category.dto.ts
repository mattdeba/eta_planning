import { PartialType } from '@nestjs/swagger';
import { CreateTariffCategoryDto } from './create-tariff-category.dto';

export class UpdateTariffCategoryDto extends PartialType(
  CreateTariffCategoryDto,
) {}
