import { User } from '@/interfaces/userManagement.interface';
import { prismaclient } from '@/prisma';


class UserManagementRepository{
    async getUsers(){
        return await prismaclient.user.findMany()
    }

    async createUser(userData:User){
        return await prismaclient.user.create({
            data:userData
        })
    }

    async updateUser(id:string,userData:User){
        return await prismaclient.user.update({
            where:{
                id
            },
            data:{
                ...userData
            }
        })
    }
    
    async deleteUser(id:string){
        return await prismaclient.user.delete({
            where:{id}
        })
    }
}

export default  new UserManagementRepository()