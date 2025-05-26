import { AddToCartDTO } from '@/dtos/add-to-cart.dto';
import { UpdateCartItemDTO } from '@/dtos/update-cart-item.dto';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@/errors';
import { currentDate } from '@/helpers/datetime';
import { prismaclient } from '@/prisma';
import { z } from 'zod';

const productInclude = {
  product: {
    include: {
      images: { where: { isMain: true }, take: 1 },
      discounts: {
        where: {
          isActive: true,
          endDate: {
            gt: currentDate(),
          },
        },
      },
    },
  },
};

export class CartService {
  private async findOrCreateCart(userId: string) {
    let cart = await prismaclient.cart.findUnique({
      where: { userId },
      include: {
        items: { include: productInclude, orderBy: { addedAt: 'asc' } },
      },
    });
    if (!cart) {
      cart = await prismaclient.cart.create({
        data: { userId },
        include: {
          items: { include: productInclude },
        },
      });
    }
    return cart;
  }

  getCart = async (userId: string) => this.findOrCreateCart(userId);

  addToCart = async (userId: string, dto: z.infer<typeof AddToCartDTO>) => {
    const user = await prismaclient.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.emailVerified) {
      throw new UnauthorizedError(
        'user must be registered and verified to add items',
      );
    }

    const product = await prismaclient.product.findUnique({
      where: { id: dto.productId, isActive: true },
    });

    if (!product) {
      throw new BadRequestError('Product not found or inactive');
    }

    await this.validateProductStock(dto.productId, dto.quantity);

    const cart = await this.findOrCreateCart(userId);
    const itemfound = cart.items.find((c) => c.productId === dto.productId);
    if (itemfound) {
      const newQuantity = itemfound.quantity + dto.quantity;
      await this.validateProductStock(dto.productId, newQuantity);

      return await prismaclient.cartItem.update({
        where: { id: itemfound.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    }

    return await prismaclient.cartItem.create({
      data: {
        quantity: dto.quantity,
        cartId: cart.id,
        productId: dto.productId,
      },
      include: { product: true },
    });
  };

  updateCartItem = async (
    userId: string,
    dto: z.infer<typeof UpdateCartItemDTO>,
  ) => {
    const cart = await prismaclient.cart.findUnique({ where: { userId } });
    if (!cart) throw new BadRequestError('Cart not found');

    const cartItem = await prismaclient.cartItem.findUnique({
      where: { id: dto.itemId },
    });

    if (!cartItem) throw new BadRequestError('Cart item not found');
    if (cartItem.cartId !== cart.id) {
      throw new ForbiddenError(
        'You do not have permission to update this item',
      );
    }

    return await prismaclient.cartItem.update({
      where: { id: dto.itemId },
      data: { quantity: dto.quantity, updatedAt: new Date() },
      include: { product: true },
    });
  };

  removeCartItem = async (userId: string, itemId: string) => {
    const cart = await prismaclient.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    const cartItem = await prismaclient.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!cartItem) throw new Error('Cart item not found');
    if (cartItem.cartId !== cart.id)
      throw new ForbiddenError(
        'You do not have permission to remove this item',
      );

    return await prismaclient.cartItem.delete({ where: { id: itemId } });
  };

  clearCart = async (userId: string) => {
    const cart = await prismaclient.cart.findUnique({ where: { userId } });
    if (!cart) return;
    return await prismaclient.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  };

  getCartTotalQuantity = async (userId: string): Promise<number> => {
    const cart = await prismaclient.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!cart) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  private async validateProductStock(
    productId: string,
    requestedQuantity: number,
  ) {
    const totalStock = await prismaclient.inventory.aggregate({
      where: {
        productId,
        store: { isActive: true },
      },
      _sum: {
        quantity: true,
      },
    });

    const availableStock = totalStock._sum.quantity || 0;

    if (availableStock < requestedQuantity) {
      throw new BadRequestError(
        `Insufficient stock. Only ${availableStock} items available.`,
      );
    }

    return availableStock;
  }
}
