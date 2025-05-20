import { pagination } from '@/helpers/pagination';
import { CreateProductDTO } from '@/interfaces/productManagement.interface';
import { prismaclient } from '@/prisma';

class ProductManagementRepository {
  async getProducts(page = 1, take = 10, adminId: string) {
    let storeId: string | undefined;
    if (adminId) {
      const store = await prismaclient.store.findUnique({
        where: { adminId },
      });
      if (!store) throw new Error(`No store found for admin ${adminId}`);
      storeId = store.id;
    }

    const whereInventory = storeId ? { storeId } : {};

    const total = await prismaclient.product.count();
    const { skip, take: realTake } = pagination(page, take);
    const data = await prismaclient.product.findMany({
      include: {
        inventory: {
          where: whereInventory,
        },
        category: true,
        images: true,
      },
      skip,
      take: realTake,
    });

    return { total, data };
  }

  async getProductById(id: string) {
    return await prismaclient.product.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });
  }

  async createProduct(productData: CreateProductDTO) {
    const { images, ...products } = productData;

    const existingProduct = await prismaclient.product.findUnique({
      where: {
        name: productData.name,
      },
    });

    if (existingProduct) {
      const error = new Error('Product already exist');
      error.name = 'DuplicateProductError';
      throw error;
    }

    const product = await prismaclient.product.create({
      data: {
        name: products.name,
        description: products.description,
        price: Number(products.price),
        weight: Number(products.weight),
        sku: products.sku,
        categoryId: products.categoryId,
        isActive: Boolean(products.isActive),
      },
    });

    const productImage = await prismaclient.productImage.createMany({
      data: productData.images.map((url, idx) => ({
        productId: product.id, // ← required here
        imageUrl: url,
        isMain: idx === 0,
      })),
    });

    return { product, productImage };
  }

  async updateProduct(id: string, payload: any) {
    const {
      name,
      description,
      price,
      weight,
      sku,
      categoryId,
      isActive,
      newImages = [],
      keptImages = [],
      mainImageIndex = 0,
    } = payload;

    const updatedProduct = await prismaclient.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        weight: parseFloat(weight),
        sku,
        categoryId,
        isActive: Boolean(isActive),
      },
    });

    await prismaclient.productImage.deleteMany({
      where: {
        productId: id,
        imageUrl: { notIn: keptImages },
      },
    });

    if (newImages.length > 0) {
      await prismaclient.productImage.createMany({
        data: newImages.map((url: string, index: number) => ({
          productId: id,
          imageUrl: url,
          isMain: index === mainImageIndex,
        })),
      });
    }

    await prismaclient.productImage.updateMany({
      where: {
        productId: id,
        imageUrl: { in: [...keptImages, ...newImages] },
      },
      data: { isMain: false },
    });

    const allImages = [...keptImages, ...newImages];
    const mainImageUrl = allImages[mainImageIndex] ?? allImages[0];

    if (mainImageUrl) {
      await prismaclient.productImage.updateMany({
        where: { productId: id, imageUrl: mainImageUrl },
        data: { isMain: true },
      });
    }

    return updatedProduct;
  }

  async deleteProduct(id: string) {
    return await prismaclient.product.delete({
      where: {
        id,
      },
    });
  }
}

export default new ProductManagementRepository();
