export interface Store {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    maxDistance: number;        
    isActive: boolean;
    isMain: boolean;            
    adminId?: string | null;    
    userId?: string | null;   
    createdAt: string;
    updatedAt: string;
}