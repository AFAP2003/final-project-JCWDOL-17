import { prismaclient } from '@/prisma';
import { AddToCartDTO } from '@/dtos/add-to-cart.dto';
import { UpdateCartItemDTO } from '@/dtos/update-cart-item.dto';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@/errors';
import { z } from 'zod';

const productInclude = {
  product: {
    include: {
      images: { where: { isMain: true }, take: 1 },
      inventory: {
        select: {
          quantity: true,
          store: { select: { id: true, name: true } },
        },
      },
    },
  },
};

export class CartService {
  private async findOrCreateCart(userId: string) {
    let cart = await prismaclient.cart.findUnique({
      where: { userId },
      include: { items: { include: productInclude } },
    });
    if (!cart) {
      cart = await prismaclient.cart.create({
        data: { userId },
        include: { items: { include: productInclude } },
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

    const cart = await this.findOrCreateCart(userId);
    const product = await prismaclient.product.findUnique({
      where: { id: dto.productId, isActive: true },
      include: { inventory: { where: { storeId: dto.storeId } } },
    });
    if (!product) throw new Error('Product not found');
    const inventory = product.inventory[0];
    if (!inventory)
      throw new BadRequestError('Product not available in selected store');
    if (inventory.quantity < dto.quantity)
      throw new BadRequestError(`Only ${inventory.quantity} item(s) available`);

    const existingItem = await prismaclient.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId },
    });

    if (existingItem) {
      const total = existingItem.quantity + dto.quantity;
      if (total > inventory.quantity)
        throw new BadRequestError(
          `Cannot add more than ${inventory.quantity} item(s)`,
        );
      return await prismaclient.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: total, updatedAt: new Date() },
        include: { product: true },
      });
    }

    return await prismaclient.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
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
      where: { id: dto.cartItemId },
    });

    if (!cartItem) throw new BadRequestError('Cart item not found');
    if (cartItem.cartId !== cart.id) {
      throw new ForbiddenError(
        'You do not have permission to update this item',
      );
    }

    if (dto.quantity === 0) {
      await prismaclient.cartItem.delete({ where: { id: dto.cartItemId } });
      return { message: 'Item removed from cart' };
    }

    const inventory = await prismaclient.inventory.findFirst({
      where: { productId: cartItem.productId, storeId: dto.storeId },
    });

    if (!inventory)
      throw new BadRequestError('Product not available in selected store');
    if (inventory.quantity < dto.quantity) {
      throw new BadRequestError(`Only ${inventory.quantity} item(s) available`);
    }

    return await prismaclient.cartItem.update({
      where: { id: dto.cartItemId },
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
}
