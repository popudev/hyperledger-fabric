import { Context, Info, Returns, Transaction } from "fabric-contract-api";
import { BaseContract } from "../common/BaseContract";
import { v4 as uuidv4 } from "uuid";
import sortKeysRecursive from "sort-keys-recursive";
import { CreateRoleDTO, Role } from "../models/Role";

@Info({ title: "RoleContract" })
export class RoleContract extends BaseContract {
  constructor() {
    super("ROLE");
  }

  @Transaction(false)
  @Returns("string")
  async getPermisson(ctx: Context, id: string) {
    const exist = await this.checkExist(ctx, id);
    if (!exist) throw new Error(`Role does not exist`);

    const role: Role = JSON.parse(await this.getById(ctx, id));

    const arrResult = [];

    for (const perId of role.permissionIds) {
      const exist = await this.checkExist(ctx, perId);
      if (!exist) continue;

      const record = await ctx.stub.getState(perId);
      arrResult.push(JSON.parse(record.toString()));
    }

    return JSON.stringify(arrResult);
  }

  @Transaction()
  @Returns("string")
  async create(ctx: Context, roleJson: string) {
    const id = uuidv4();
    const roleData: CreateRoleDTO = JSON.parse(roleJson);

    const role: Role = {
      docType: this.assetName,
      id: id,
      ...roleData,
      createdAt: new Date().toJSON(),
      updatedAt: new Date().toJSON(),
      deletedAt: "",
    };

    const roleCreatedJson = JSON.stringify(sortKeysRecursive(role));

    await ctx.stub.putState(role.id, Buffer.from(roleCreatedJson));

    return roleCreatedJson;
  }

  @Transaction()
  async update(ctx: Context, id: string, roleJson: string) {
    const exist = await this.checkExist(ctx, id);
    if (!exist) throw new Error(`Role does not exist`);

    const rolePrev = JSON.parse(await this.getById(ctx, id));
    const roleCur = JSON.parse(roleJson);

    const role: Role = {
      ...rolePrev,
      ...roleCur,
      updatedAt: new Date().toJSON(),
    };

    const roleUpdatedJson = JSON.stringify(sortKeysRecursive(role));
    await ctx.stub.putState(id, Buffer.from(roleUpdatedJson));
    return roleUpdatedJson;
  }

  @Transaction()
  async delete(ctx: Context, id: string) {
    const exist = await this.checkExist(ctx, id);
    if (!exist) throw new Error(`Role does not exist`);
    await ctx.stub.deleteState(id);
  }
}
