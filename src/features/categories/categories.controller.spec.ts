import { Test } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { CategoriesService } from './categories.service.js';
import { CategoriesController } from './categories.controller.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = moduleRef.get<CategoriesController>(CategoriesController);
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [
        {
          id: 1,
          name: 'Programming',
          slug: 'programming',
          description: 'Programming tutorials',
        },
        {
          id: 2,
          name: 'Database',
          slug: 'database',
          description: 'Database tutorials',
        },
      ];
      mockCategoriesService.findAll.mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(mockCategoriesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });


    describe('findOne', () => {
      it('should return a category', async () => {
        const categories = {
          id: 2,
          name: 'Database',
          slug: 'database',
          description: 'Database tutorials',
        };

        mockCategoriesService.findOne.mockResolvedValue(categories);

        const result = await controller.findOne(2);

        expect(mockCategoriesService.findOne).toHaveBeenCalledWith(2);
        expect(result).toEqual(categories);
      });
    });

    describe('create', ()=>{
        it('should create a category', async ()=>{
            const dto ={
                name:'programing',
                description:'programing tutorials'
            }
            const createdCategory ={
                id:1,
                name:'programing',
                slug:'programing',
                description:'programing tutorials'

            }

            mockCategoriesService.create.mockResolvedValue(createdCategory);

            const result = await controller.create(dto);

            expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(createdCategory);
        });
    });

  });
});
