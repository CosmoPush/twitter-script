import type { Request, Response, NextFunction } from "express";
import { targetUsersService } from "./targetUsers.service.js";

class TargetUsersController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { screen_name_list } = req.body;
      const result = await targetUsersService.createUsers(screen_name_list);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { screen_name } = req.params;
      const { new_screen_name } = req.body;

      if (!screen_name || Array.isArray(screen_name)) {
        throw new Error("screen_name is required");
      }

      if (!new_screen_name) {
        throw new Error("new_screen_name is required");
      }

      const user = await targetUsersService.updateUser(
        screen_name,
        new_screen_name,
      );
      res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async deleteMany(req: Request, res: Response, next: NextFunction) {
    try {
      const { names_list } = req.body;
      await targetUsersService.deleteManyUsers(names_list);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await targetUsersService.getUsers();
      res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

export const targetUsersController = new TargetUsersController();
