import { Discount } from '@/interfaces/discountManagement.interface';
import discountManagementRepository from '@/repositories/discountManagement.repository';

class DiscountManagementService {
  async listAllDiscounts(page = 1, take = 10,adminId?:string) {
    return await discountManagementRepository.getDiscounts(page, take,adminId);
  }

  async createNewDiscount(discountData: Discount,adminId?:string) {
    return await discountManagementRepository.createDiscount(discountData,adminId);
  }

  async updateDiscountById(id: string, discountData: Discount) {
    return await discountManagementRepository.updateDiscount(id, discountData);
  }

  async deleteDiscountById(id: string) {
    return await discountManagementRepository.deleteDiscount(id);
  }
}

export default new DiscountManagementService();
