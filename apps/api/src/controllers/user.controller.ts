import { AddressCreateDTO } from '@/dtos/address-create.dto';
import { AddressDeleteDTO } from '@/dtos/address-delete.dto';
import { AddressGetAllDTO } from '@/dtos/address-get-all.dto';
import { AddressUpdateDTO } from '@/dtos/address-update.dto';
import { UserUpdateBioDTO } from '@/dtos/user-update-bio-dto';
import { UserUpdateEmailDTO } from '@/dtos/user-update-email.dto';
import {
  ApiError,
  InternalSeverError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getImageFromRequest } from '@/helpers/get-image-from-request';
import { getSession } from '@/helpers/session-helper';
import { AddressService } from '@/services/address.service';
import { MediaService } from '@/services/media.service';
import { UserService } from '@/services/user.service';
import { Request, Response } from 'express';

export class UserController {
  private addressService = new AddressService();
  private userService = new UserService();
  private mediaService = new MediaService();

  whoami = async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      res.json(session);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  updateBio = async (req: Request, res: Response) => {
    const session = getSession(req);
    const { data: dto, error } = UserUpdateBioDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const { user } = await this.userService.updateBio(dto, session.user.id);
      res.json(user);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  updateEmail = async (req: Request, res: Response) => {
    const session = getSession(req);
    const { data: dto, error } = UserUpdateEmailDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.userService.updateEmail(dto, session.user.id);
      res.json({
        message: `Verification email has been sent to ${session.user.email}`,
        url: result.url,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  postProfile = async (req: Request, res: Response) => {
    const image = getImageFromRequest(req);
    const session = getSession(req);

    try {
      const url = await this.mediaService.uploadImage({
        file: image.buffer,
      });

      const user = await this.userService.getByEmail(session.user.email);
      if (!user) throw new UnauthorizedError();

      if (user.image && user.image.startsWith('https://res.cloudinary.com')) {
        await this.mediaService.removeImage(user.image);
      }

      await this.userService.updateImage({
        userId: user.id,
        image: url,
      });

      res.status(201).json({ url });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err.message);
      }
      throw error;
    }
  };

  createAddress = async (req: Request, res: Response) => {
    const { data: dto, error } = AddressCreateDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const { address } = await this.addressService.createAddress(dto, req);
      res.json(address);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  updateAddress = async (req: Request, res: Response) => {
    const { data: dto, error } = AddressUpdateDTO.safeParse({
      ...req.body,
      ...req.params,
    });
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const { address } = await this.addressService.updateAddress(dto, req);
      res.json(address);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  getAllAddress = async (req: Request, res: Response) => {
    const { data: dto, error } = AddressGetAllDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const results = await this.addressService.getAllAddress(dto, req);
      res.json(results);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  deleteAddress = async (req: Request, res: Response) => {
    const { data: dto, error } = AddressDeleteDTO.safeParse(req.params);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      await this.addressService.deleteAddress(dto, req);
      res.json({
        message: `Successfully delete address with id ${dto.addressId}`,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  getAvailableAdmin = async (req: Request, res: Response) => {
    try {
      const admins = await this.userService.getAvailableAdmin();
      res.json(admins);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
