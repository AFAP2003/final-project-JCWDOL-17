import { pagination } from '@/helpers/pagination';
import { Category } from '@/interfaces/categoryManagement.interface';
import { prismaclient } from '@/prisma';

class CategoryManagementRepository {
  async getCategories(page = 1, take = 10, search = '') {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { description: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};
    const total = await prismaclient.category.count({ where });

    const { skip, take: realTake } = pagination(page, take);
    const data = await prismaclient.category.findMany({
      where,
      skip,
      take: realTake,
    });

    return { total, data };
  }

  async createCategory(categoryData: Category) {
    const existingCategoryName = await prismaclient.category.findUnique({
      where: {
        name: categoryData.name,
      },
    });

    if (existingCategoryName) {
      const error = new Error('Name already exist');
      error.name = 'DuplicateNameError';
      throw error;
    }
    return await prismaclient.category.create({
      data: categoryData,
    });
  }

  async updateCategory(id: string, categoryData: Category) {
    return await prismaclient.category.update({
      where: {
        id,
      },
      data: {
        ...categoryData,
      },
    });
  }

  async deleteCategory(id: string) {
    return await prismaclient.category.delete({
      where: {
        id,
      },
    });
  }
}

export default new CategoryManagementRepository();
