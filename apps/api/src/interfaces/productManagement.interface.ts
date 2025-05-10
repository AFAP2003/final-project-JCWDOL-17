export interface Product {
    id: string
    name: string
    description?: string
    price: number
    weight?: number
    sku: string
    categoryId: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface CreateProductDTO {
    name:        string
    description?: string
    price:       number
    weight?:     number
    sku:         string
    categoryId:  string
    isActive:    boolean
    images:      string[]   
  }