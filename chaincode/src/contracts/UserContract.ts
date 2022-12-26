import { Context, Info, Returns, Transaction } from "fabric-contract-api";
import stringify from "json-stringify-deterministic";
import sortKeysRecursive from "sort-keys-recursive";
import { BaseContract } from "../common/BaseContract";
import { CreateUserDTO, User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../models/Role";

@Info({ title: "UserContract", description: "Smart contract for trading assets" })
export class UserContract extends BaseContract {
  constructor() {
    super("USER");
  }

  // @Transaction(false)
  // @Returns("string")
  // async getAll(ctx: Context): Promise<string> {
  //   const users: User[] = JSON.parse(await super.getAll(ctx));

  //   for (const user of users) {
  //     const role: Role = JSON.parse((await ctx.stub.getState(user.role)).toString());
  //     user.role = role.name;
  //   }

  //   return JSON.stringify(users);
  // }

  @Transaction()
  @Returns("string")
  async create(ctx: Context, userJson: string) {
    const id = uuidv4();
    const userData: CreateUserDTO = JSON.parse(userJson);
    const user: User = {
      docType: this.assetName,
      id: id,
      ...userData,
      createdAt: new Date().toJSON(),
      updatedAt: new Date().toJSON(),
      deletedAt: "",
    };

    const userCreatedJson = JSON.stringify(sortKeysRecursive(user));
    await ctx.stub.putState(id, Buffer.from(userCreatedJson));

    return userCreatedJson;
  }

  @Transaction()
  @Returns("string")
  async update(ctx: Context, id: string, userJson: string) {
    const exist = await this.checkExist(ctx, id);

    if (!exist) {
      throw new Error(`${this.assetName} with ${id} does not exist`);
    }

    const userPrev: User = JSON.parse(await this.getById(ctx, id));
    const userCur: User = JSON.parse(userJson);
    const user: User = {
      ...userPrev,
      ...userCur,
      updatedAt: new Date().toJSON(),
    };

    const userUpdatedJson = JSON.stringify(sortKeysRecursive(user));
    await ctx.stub.putState(id, Buffer.from(userUpdatedJson));
    return userUpdatedJson;
  }

  @Transaction()
  async delete(ctx: Context, id: string) {
    const exist = await this.checkExist(ctx, id);

    if (!exist) {
      throw new Error(`${this.assetName} with ${id} does not exist`);
    }

    const userPrev: User = JSON.parse(await this.getById(ctx, id));
    const user: User = {
      ...userPrev,
      deletedAt: new Date().toJSON(),
    };

    const userUpdatedAt = JSON.stringify(sortKeysRecursive(user));
    await ctx.stub.putState(id, Buffer.from(userUpdatedAt));
  }
}
