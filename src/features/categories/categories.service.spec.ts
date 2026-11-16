import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { Category } from './entities/category.entity.js';
import { CategoriesService } from './categories.service.js';

describe('categoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    exists: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(CategoriesService);
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const dto = {
        name: 'programing',
        description: 'programing tutorials',
      };

      const category = {
        id: 1,
        name: 'programing',
        slug: 'programing',
        description: 'programing tutorials',
      };
      mockCategoryRepository.exists.mockResolvedValue(false);
      mockCategoryRepository.create.mockReturnValue(category);
      mockCategoryRepository.save.mockResolvedValue(category);

      const result = await service.create(dto);

      expect(mockCategoryRepository.exists).toHaveBeenCalled();

      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: 'programing',
        slug: 'programing',
        description: 'programing tutorials',
      });

      expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);

      expect(result).toEqual(category);
    });

    it('should generate a unique slug when slug already exists', async () => {
      const dto = {
        name: 'programing',
        description: 'programing tutorials',
      };

      const category = {
        id: 2,
        name: 'programing',
        slug: 'programing-2',
        description: 'programing tutorials',
      };

      mockCategoryRepository.exists
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      mockCategoryRepository.create.mockReturnValue(category);
      mockCategoryRepository.save.mockResolvedValue(category);

      const result = await service.create(dto);

      expect(mockCategoryRepository.exists).toHaveBeenCalledTimes(2);

      expect(mockCategoryRepository.exists).toHaveBeenNthCalledWith(1, {
        where: { slug: 'programing' },
      });

      expect(mockCategoryRepository.exists).toHaveBeenNthCalledWith(2, {
        where: { slug: 'programing-2' },
      });

      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: 'programing',
        slug: 'programing-2',
        description: 'programing tutorials',
      });

      expect(result).toEqual(category);
    });

    it('should throw BadRequestException when slug cannot be generated', async () => {
      const dto = {
        name: '   ',
        description: 'Invalid category',
      };

      await expect(service.create(dto)).rejects.toThrow(
        'Cannot generate a slug from this name',
      );
    });

    describe('findAll', () => {
      it('should return all categories', async () => {
        const categories = [
          {
            id: 1,
            name: 'programing',
            slug: 'programing',
            description: 'programing tutorials',
          },
          {
            id: 2,
            name: 'design',
            slug: 'design',
            description: 'design tutorials',
          },
        ];

        mockCategoryRepository.find.mockResolvedValue(categories);

        const result = await service.findAll();

        expect(mockCategoryRepository.find).toHaveBeenCalledWith({
          order: { name: 'ASC' },
        });

        expect(result).toEqual(categories);
      });
    });

    describe('findOne', () => {
      it('should return a category by id ', async () => {
        const category = {
          id: 1,
          name: 'programing',
          slug: 'programing',
          description: 'programing tutorials',
        };

        mockCategoryRepository.findOne.mockResolvedValue(category);

        const result = await service.findOne(1);

        expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
          where: { id: 1 },
        });

        expect(result).toEqual(category);
      });

      it('should throw an error if category not found', async () => {
        mockCategoryRepository.findOne.mockResolvedValue(null);

        await expect(service.findOne(1)).rejects.toThrow(
          'Category not found',
        );
      });
    });

    describe('update', () => {
      it('should update a category successfully', async () => {
        // Arrange
        const id = 1;

        const dto = {
          name: 'programming updated',
          description: 'updated description',
        };

        const existingCategory = {
          id: 1,
          name: 'programing',
          slug: 'programing',
          description: 'programing tutorials',
        };

        const updatedCategory = {
          id: 1,
          name: 'programming updated',
          slug: 'programming-updated',
          description: 'updated description',
        };

        mockCategoryRepository.findOne
          .mockResolvedValueOnce(existingCategory)
          .mockResolvedValueOnce(updatedCategory);

        mockCategoryRepository.exists.mockResolvedValue(false);

        mockCategoryRepository.save.mockResolvedValue(updatedCategory);

        // Act
        const result = await service.update(id, dto);

        // Assert
        expect(mockCategoryRepository.findOne).toHaveBeenCalledTimes(2);

        expect(mockCategoryRepository.findOne).toHaveBeenNthCalledWith(1, {
          where: { id },
        });

        expect(mockCategoryRepository.findOne).toHaveBeenNthCalledWith(2, {
          where: { id },
        });

        expect(mockCategoryRepository.exists).toHaveBeenCalledWith({
          where: {
            slug: 'programming-updated',
            id: expect.anything(),
          },
        });

        expect(mockCategoryRepository.save).toHaveBeenCalledWith(
          updatedCategory,
        );

        expect(result).toEqual(updatedCategory);
      });
    });

    describe('remove', () => {
      it('should remove a category successfully', async () => {
        // Arrange
        const id = 1;

        const existingCategory = {
          id: 1,
          name: 'programing',
          slug: 'programing',
          description: 'programing tutorials',
          posts: [],
        };

        mockCategoryRepository.findOne.mockResolvedValue(existingCategory);

        // Act
        await service.remove(id);

        // Assert
        expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
          where: { id },
          relations: { posts: true },
        });

        expect(mockCategoryRepository.remove).toHaveBeenCalledWith(
          existingCategory,
        );
      });

      it('should throw NotFoundException when category not found', async () => {
        // Arrange
        const id = 1;

        mockCategoryRepository.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(service.remove(id)).rejects.toThrow('Category not found');

        expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when category has posts', async () => {
        // Arrange
        const id = 1;

        const existingCategory = {
          id: 1,
          name: 'programing',
          slug: 'programing',
          description: 'programing tutorials',
          posts: [
            {
              id: 1,
              title: 'Post 1',
              content: 'Content of Post 1',
            },
          ],
        };

        mockCategoryRepository.findOne.mockResolvedValue(existingCategory);

        // Act & Assert
        await expect(service.remove(id)).rejects.toThrow(
          'Cannot delete a category that is assigned to posts',
        );

        expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
      });
    });
  });
});
