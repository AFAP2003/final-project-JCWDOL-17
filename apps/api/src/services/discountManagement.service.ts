import { Discount } from '@/interfaces/discountManagement.interface';
import discountManagementRepository from '@/repositories/discountManagement.repository';

class DiscountManagementService {
  async listAllDiscounts(page = 1, take = 10) {
    return await discountManagementRepository.getDiscounts(page, take);
  }

  async createNewDiscount(discountData: Discount) {
    return await discountManagementRepository.createDiscount(discountData);
  }

  async updateDiscountById(id: string, discountData: Discount) {
    return await discountManagementRepository.updateDiscount(id, discountData);
  }

  async deleteDiscountById(id: string) {
    return await discountManagementRepository.deleteDiscount(id);
  }
}

export default new DiscountManagementService();
