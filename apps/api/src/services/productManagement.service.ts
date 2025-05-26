import { CreateProductDTO } from '@/interfaces/productManagement.interface';
import productManagementRepository from '@/repositories/productManagement.repository';

class ProductManagementService {
  async listAllProducts(
    page = 1,
    take = 10,
    adminId?: string,
    search = '',
    categoryId = '',
    status = '',
  ) {
    return await productManagementRepository.getProducts(
      page,
      take,
      adminId,
      search,
      categoryId,
      status,
    );
  }

  async getProductDetail(id: string) {
    return await productManagementRepository.getProductById(id);
  }

  async createNewProduct(productData: CreateProductDTO) {
    return await productManagementRepository.createProduct(productData);
  }

  async updateProductById(id: string, payload: any) {
    return await productManagementRepository.updateProduct(id, payload);
  }

  async deleteProductById(id: string) {
    return await productManagementRepository.deleteProduct(id);
  }
}

export default new ProductManagementService();
