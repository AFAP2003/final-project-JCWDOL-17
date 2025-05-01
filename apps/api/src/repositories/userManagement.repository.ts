import { pagination } from '@/helpers/pagination';
import { User } from '@/interfaces/userManagement.interface';
import { prismaclient } from '@/prisma';


class UserManagementRepository{
    async getUsers(page=1,take=1){
        const total = await prismaclient.user.count()
         const {skip,take:realTake} = pagination(page,take)
                const data= await prismaclient.user.findMany({
                    include:{
                        addresses:true,
                        Store:true
                    },
                    skip,
                    take:realTake
                })
        
                return{total,data}
        
       
    }

    async createUser(userData:User){

        const existingUser = await prismaclient.user.findUnique({
            where:{
                email:userData.email
            }
        })

        if(existingUser){
            const error = new Error('Email already exist')
            error.name = 'DuplicateEmailError'
            throw error
        }
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