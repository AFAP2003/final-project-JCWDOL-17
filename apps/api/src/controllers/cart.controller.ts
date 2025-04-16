import { AddToCartDTO } from '@/dtos/add-to-cart.dto';
import { UpdateCartItemDTO } from '@/dtos/update-cart-item.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSessionUser } from '@/helpers/session-helper';
import { CartService } from '@/services/cart.service';
import { Request, Response } from 'express';

export class CartController {
  private cartService = new CartService();

  getCart = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const cart = await this.cartService.getCart(user.id);
      res.json(cart);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  addToCart = async (req: Request, res: Response) => {
    const { data: dto, error } = AddToCartDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const { user } = getSessionUser(req);
      const cartItem = await this.cartService.addToCart(user.id, dto);
      res.json(cartItem);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  updateCartItem = async (req: Request, res: Response) => {
    const { data: dto, error } = UpdateCartItemDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const { user } = getSessionUser(req);
      const cartItem = await this.cartService.updateCartItem(user.id, dto);
      res.json(cartItem);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  removeCartItem = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const itemId = req.params.itemId;
      await this.cartService.removeCartItem(user.id, itemId);
      res.json({ message: 'Item removed from cart successfully' });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  clearCart = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      await this.cartService.clearCart(user.id);
      res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
