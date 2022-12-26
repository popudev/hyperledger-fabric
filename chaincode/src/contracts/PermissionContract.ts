import { Context, Info, Returns, Transaction } from "fabric-contract-api";
import { BaseContract } from "../common/BaseContract";
import { v4 as uuidv4 } from "uuid";
import sortKeysRecursive from "sort-keys-recursive";
import { CreatePermissionDTO, Permission } from "../models/Permission";

@Info({ title: "PermissionContract", description: "Smart contract for trading assets" })
export class PermissionContract extends BaseContract {
  constructor() {
    super("PERMISSION");
  }

  @Transaction()
  @Returns("string")
  async create(ctx: Context, permissionJson: string) {
    const id = uuidv4();
    const permissionData: CreatePermissionDTO = JSON.parse(permissionJson);

    const permission: Permission = {
      docType: this.assetName,
      id: id,
      ...permissionData,
      createdAt: new Date().toJSON(),
      updatedAt: new Date().toJSON(),
      deletedAt: "",
    };

    const permissionCreatedJson = JSON.stringify(sortKeysRecursive(permission));

    await ctx.stub.putState(permission.id, Buffer.from(permissionCreatedJson));

    return permissionCreatedJson;
  }

  @Transaction()
  async delete(ctx: Context, id: string) {
    const exist = await this.checkExist(ctx, id);

    if (!exist) {
      throw new Error(`${this.assetName} with ${id} does not exist`);
    }

    await ctx.stub.deleteState(id);
  }
}
