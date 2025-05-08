import { AddToCartDTO } from '@/dtos/add-to-cart.dto';
import { UpdateCartItemDTO } from '@/dtos/update-cart-item.dto';
import { UnprocessableEntityError } from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSessionUser } from '@/helpers/session-helper';
import { CartService } from '@/services/cart.service';
import { Request, Response } from 'express';

export class CartController {
  private cartService = new CartService();

  getCart = async (req: Request, res: Response) => {
    const { user } = getSessionUser(req);
    const cart = await this.cartService.getCart(user.id);
    res.json(cart);
  };

  addToCart = async (req: Request, res: Response) => {
    const { data: dto, error } = AddToCartDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    const { user } = getSessionUser(req);
    const cartItem = await this.cartService.addToCart(user.id, dto);
    res.json(cartItem);
  };

  updateCartItem = async (req: Request, res: Response) => {
    const { data: dto, error } = UpdateCartItemDTO.safeParse({
      ...req.body,
      ...req.params,
    });
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    const { user } = getSessionUser(req);
    const cartItem = await this.cartService.updateCartItem(user.id, dto);
    res.json(cartItem);
  };

  removeCartItem = async (req: Request, res: Response) => {
    const { user } = getSessionUser(req);
    const itemId = req.params.itemId;

    await this.cartService.removeCartItem(user.id, itemId);
    res.json({ message: 'Item removed from cart' });
  };

  clearCart = async (req: Request, res: Response) => {
    const { user } = getSessionUser(req);
    await this.cartService.clearCart(user.id);
    res.json({ message: 'Item removed from cart' });
  };

  getCartTotalQuantity = async (req: Request, res: Response) => {
    const { user } = getSessionUser(req);
    const totalQuantity = await this.cartService.getCartTotalQuantity(user.id);
    res.json({ totalQuantity });
  };
}
