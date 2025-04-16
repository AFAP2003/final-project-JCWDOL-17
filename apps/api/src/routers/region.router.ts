import { RegionController } from '@/controllers/region.controller';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class RegionRouter {
  private router: Router;
  private controller: RegionController;

  constructor() {
    this.controller = new RegionController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/geo-places', asynchandler(this.controller.geoPlaces));
    this.router.get('/province', asynchandler(this.controller.provinceGetAll));
    this.router.get('/city', asynchandler(this.controller.cityGetAll));
  }

  getRouter(): Router {
    return this.router;
  }
}
