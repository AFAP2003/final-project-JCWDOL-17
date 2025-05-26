import { User } from '@/interfaces/userManagement.interface';
import userManagementRepository from '@/repositories/userManagement.repository';

class UserManagementService {
  async listAllUsers(
    page = 1,
    take = 10,
    search = '',
    role = '',
    verified = '',
  ) {
    return await userManagementRepository.getUsers(
      page,
      take,
      search,
      role,
      verified,
    );
  }

  async listUserById(id: string) {
    return await userManagementRepository.getUserById(id);
  }

  async createNewUser(userData: User) {
    return await userManagementRepository.createUser(userData);
  }

  async updateUserById(id: string, userData: User) {
    return userManagementRepository.updateUser(id, userData);
  }

  async deleteUserById(id: string) {
    return userManagementRepository.deleteUser(id);
  }
}

export default new UserManagementService();
