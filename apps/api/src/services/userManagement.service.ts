import { User } from "@/interfaces/userManagement.interface";
import storeManagementRepository from "@/repositories/storeManagement.repository";
import userManagementRepository from "@/repositories/userManagement.repository";

class UserManagementService{
    async listAllUsers(page=1,take=10){     
        return await userManagementRepository.getUsers(page,take)
    }

    async createNewUser(userData:User){
        return await userManagementRepository.createUser(userData)

    }

    async updateUserById(id:string,userData:User){
        return userManagementRepository.updateUser(id,userData)
    }

    async deleteUserById(id:string){
        return userManagementRepository.deleteUser(id)
    }
}

export default new UserManagementService()