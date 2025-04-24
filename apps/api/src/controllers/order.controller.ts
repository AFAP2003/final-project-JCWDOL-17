import { CreateOrderDTO } from '@/dtos/create-order.dto';
import { UnprocessableEntityError } from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { OrderService } from '@/services/order.service';

export class OrderController {
  private orderService = new OrderService();

  // User endpoints
  createOrder = async (req: Request, res: Response) => {
    const { data: dto, error } = CreateOrderDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }
  };

  getUserOrders = {};
}
