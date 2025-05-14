import { toNodeHandler } from 'better-auth/node';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, json, urlencoded } from 'express';
import path from 'path';
import { auth } from './auth';
import { BASE_FRONTEND_URL, PORT } from './config';
import { withError, withNotFound } from './middlewares/errors.middleware';
import { AuthRouter } from './routers/auth.router';
import { CartRouter } from './routers/cart.router';
import apiRouter from './routers/dashboardApi.router';
import { HealthRouter } from './routers/health.router';
import { LocationRouter } from './routers/location.router';
import { OrderRouter } from './routers/order.router';
import { PaymentRouter } from './routers/payment.router';
import { ProductCategoryRouter } from './routers/product-category.router';
import { ProductRouter } from './routers/product.router';
import { ShippingMethodRouter } from './routers/shipping-method.router';
import { ShippingRouter } from './routers/shipping.router';
import { StoreRouter } from './routers/store.router';
import { TokenRouter } from './routers/token.router';
import { UserRouter } from './routers/user.router';
import { VoucherRouter } from './routers/voucher.router';
import { WebhookRouter } from './routers/webhook.router';

export default class App {
  static VERSION = '1.0.0';
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.app.use(
      '/uploads',
      express.static(path.join(__dirname, '../uploads')),
    );
    this.handleError();
  }

  private configure(): void {
    this.app.use(
      cors({
        origin: BASE_FRONTEND_URL,
        credentials: true,
      }),
    );
    this.app.all('/api/better/auth/*', toNodeHandler(auth));
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private handleError(): void {
    this.app.use(withNotFound);
    this.app.use(withError);
  }

  private routes(): void {
    const healthRouter = new HealthRouter();
    const authRouter = new AuthRouter();
    const userRouter = new UserRouter();
    const tokenRouter = new TokenRouter();
    const locationRouter = new LocationRouter();
    const productCategoryRouter = new ProductCategoryRouter();
    const productRouter = new ProductRouter();
    const cartRouter = new CartRouter();
    const voucherRouter = new VoucherRouter();
    const shippingMethodRouter = new ShippingMethodRouter();
    const orderRouter = new OrderRouter();
    const paymentRouter = new PaymentRouter();
    const webhookRouter = new WebhookRouter();
    const shippingRouter = new ShippingRouter();
    const storeRuter = new StoreRouter();

    this.app.use('/api', healthRouter.getRouter());
    this.app.use('/api/auth', authRouter.getRouter());
    this.app.use('/api/user', userRouter.getRouter());
    this.app.use('/api/token', tokenRouter.getRouter());
    this.app.use('/api/location', locationRouter.getRouter());
    this.app.use('/api/product-category', productCategoryRouter.getRouter());
    this.app.use('/api/product', productRouter.getRouter());
    this.app.use('/api/dashboard', apiRouter);
    this.app.use('/api/cart', cartRouter.getRouter());
    this.app.use('/api/voucher', voucherRouter.getRouter());
    this.app.use('/api/shipping-methods', shippingMethodRouter.getRouter());
    this.app.use('/api/shipping', shippingRouter.getRouter());
    this.app.use('/api/orders', orderRouter.getRouter());
    this.app.use('/api/payment', paymentRouter.getRouter());
    this.app.use('/api/webhooks', webhookRouter.getRouter());
    this.app.use('/api/store', storeRuter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/api`);
    });
  }
}