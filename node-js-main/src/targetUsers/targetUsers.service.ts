import ApiError from "../errors/apiError.js";
import { prisma } from "../prisma/index.js";

class TargetUsersService {
  async createUsers(screenNames: string[]) {
    if (!Array.isArray(screenNames) || screenNames.length === 0) {
      throw new ApiError("screen_name_list is empty", 400);
    }

    return prisma.targetUser.createMany({
      data: screenNames.map((name) => ({
        screen_name: name,
      })),
      skipDuplicates: true,
    });
  }

  async updateUser(oldScreenName: string, newScreenName: string) {
    try {
      return await prisma.targetUser.update({
        where: { screen_name: oldScreenName },
        data: { screen_name: newScreenName },
      });
    } catch {
      throw new ApiError("User not found", 404);
    }
  }

  async deleteManyUsers(namesList: string[]) {
    if (!Array.isArray(namesList) || namesList.length === 0) {
      throw new ApiError("names_list is empty", 400);
    }

    return prisma.targetUser.deleteMany({
      where: {
        screen_name: {
          in: namesList,
        },
      },
    });
  }

  async getUsers() {
    return prisma.targetUser.findMany();
  }
}

export const targetUsersService = new TargetUsersService();
