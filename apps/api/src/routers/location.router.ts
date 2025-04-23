import { LocationController } from '@/controllers/location.controller';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class LocationRouter {
  private router: Router;
  private controller: LocationController;

  constructor() {
    this.controller = new LocationController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/geocoding', asynchandler(this.controller.geocoding));
    this.router.get('/province', asynchandler(this.controller.provinceGetAll));
    this.router.get('/city', asynchandler(this.controller.cityGetAll));
  }

  getRouter(): Router {
    return this.router;
  }
}
