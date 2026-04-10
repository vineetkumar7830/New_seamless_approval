import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { throwException } from 'src/util/util/errorhandling';
import CustomError from 'src/provider/customer-error.service';
import CustomResponse from 'src/provider/custom-response.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
  ) { }
  async create(
    dto: CreateCategoryDto,
    companyId: string,
  ): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing. Please relogin.');
      }
      const exists = await this.categoryModel.findOne({
        companyId: new Types.ObjectId(companyId),
        name: dto.name.trim(),
        type: dto.type,
        isActive: true,
      });

      if (exists) {
        throw new CustomError(400, 'Category already exists');
      }

      const category = await this.categoryModel.create({
        name: dto.name.trim(),
        type: dto.type,
        companyId: new Types.ObjectId(companyId),
        isActive: true,
      });

      return new CustomResponse(
        201,
        'Category added successfully',
        category,
      );
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async findAll(
    companyId: string,
    type?: string,
  ): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing. Please relogin.');
      }
      const filter: any = {
        companyId: new Types.ObjectId(companyId),
        isActive: true,
      };

      if (type && ['income', 'expense'].includes(type)) {
        filter.type = type;
      }

      const categories = await this.categoryModel
        .find(filter)
        .sort({ name: 1 });

      return new CustomResponse(
        200,
        'Categories fetched successfully',
        categories,
      );
    } catch (error) {
      throwException(error);
      throw error;
    }
  }
  async findOne(
    id: string,
    companyId: string,
  ): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing. Please relogin.');
      }
      const category = await this.categoryModel.findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
        isActive: true,
      });

      if (!category) {
        throw new CustomError(404, 'Category not found');
      }

      return new CustomResponse(
        200,
        'Category fetched successfully',
        category,
      );
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    companyId: string,
  ): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing. Please relogin.');
      }
      if (dto.name) {
        const duplicate = await this.categoryModel.findOne({
          _id: { $ne: new Types.ObjectId(id) },
          companyId: new Types.ObjectId(companyId),
          name: dto.name.trim(),
          type: dto.type,
          isActive: true,
        });

        if (duplicate) {
          throw new CustomError(400, 'Category already exists');
        }

        dto.name = dto.name.trim();
      }

      const category = await this.categoryModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          companyId: new Types.ObjectId(companyId),
          isActive: true,
        },
        { ...dto, companyId: new Types.ObjectId(companyId) },
        { new: true },
      );

      if (!category) {
        throw new CustomError(404, 'Category not found');
      }

      return new CustomResponse(
        200,
        'Category updated successfully',
        category,
      );
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async remove(
    id: string,
    companyId: string,
  ): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing. Please relogin.');
      }
      const category = await this.categoryModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          companyId: new Types.ObjectId(companyId),
        },
        { isActive: false },
        { new: true },
      );

      if (!category) {
        throw new CustomError(404, 'Category not found');
      }

      return new CustomResponse(
        200,
        'Category removed successfully',
        category,
      );
    } catch (error) {
      throwException(error);
      throw error;
    }
  }
}
