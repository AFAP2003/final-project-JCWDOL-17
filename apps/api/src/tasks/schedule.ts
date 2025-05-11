import { OrderService } from '@/services/order.service';
import cron from 'node-cron';

export class ScheduledTasks {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
    this.initializeScheduledTasks();
  }

  private initializeScheduledTasks() {
    cron.schedule('*/5 * * * *', async () => {
      console.log('Running scheduled task: Check expired orders');
      try {
        const result = await this.orderService.checkExpiredOrders();
        console.log(`Processed ${result.processed} expired orders`);
      } catch (error) {
        console.error('Error processing expired orders:', error);
      }
    });

    cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled task: Auto-confirm shipped orders');
      try {
        const result = await this.orderService.checkOrdersForAutoConfirmation();
        console.log(`Auto-confirmed ${result.processed} orders`);
      } catch (error) {
        console.error('Error auto-confirming orders:', error);
      }
    });
  }
}

export const scheduledTasks = new ScheduledTasks();
