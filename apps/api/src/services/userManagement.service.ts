import { User } from "@/interfaces/userManagement.interface";
import storeManagementRepository from "@/repositories/storeManagement.repository";
import userManagementRepository from "@/repositories/userManagement.repository";

class UserManagementService{
    async listAllUsers(){
        return await userManagementRepository.getUsers()
    }

    async createNewUser(userData:User){
        const user = await userManagementRepository.createUser(userData)

        return user
    }

    async updateUserById(id:string,userData:User){
        return userManagementRepository.updateUser(id,userData)
    }

    async deleteUserById(id:string){
        return userManagementRepository.deleteUser(id)
    }
}

export default new UserManagementService()