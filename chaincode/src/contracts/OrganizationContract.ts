import { Context, Returns, Transaction } from "fabric-contract-api";
import { BaseContract } from "../common/BaseContract";
import { v4 as uuidv4 } from "uuid";
import sortKeysRecursive from "sort-keys-recursive";
import { CreateOrganizationDTO, Organization, OrganizationTree } from "../models/Organization";

export class OrganizationContract extends BaseContract {
  constructor() {
    super("ORGANIZATION");
  }

  private getTreeRecursive(organizations: Organization[], parentId: string) {
    /*
    [{
      docType: "ORGANIZATION"
      id: 1,
      name: "Ban Giam Doc",
      parentId: "",
    }]
    */
    const children = organizations.filter((org) => org.parentId === parentId);

    const result: OrganizationTree[] = children.map((child) => {
      return {
        id: child.id,
        name: child.name,
        children: this.getTreeRecursive(organizations, child.id),
      };
    });

    return result;
  }

  @Transaction(false)
  @Returns("string")
  async getTree(ctx: Context) {
    const organizations = JSON.parse(await this.getAll(ctx));
    const result = this.getTreeRecursive(organizations, "");
    return JSON.stringify(result);
  }

  @Transaction(false)
  @Returns("string")
  async getChildren(ctx: Context, parentId: string) {
    const query = {
      selector: {
        docType: this.assetName,
        parentId: parentId,
      },
    };

    const allResults = [];

    const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
    let result = await iterator.next();

    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString("utf8");
      let record: any;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }

    return JSON.stringify(allResults);
  }

  @Transaction()
  @Returns("string")
  async create(ctx: Context, organizationJson: string) {
    const id = uuidv4();
    const organizationData: CreateOrganizationDTO = JSON.parse(organizationJson);

    const organization: Organization = {
      id: id,
      docType: this.assetName,
      ...organizationData,
      createdAt: new Date().toJSON(),
      updatedAt: new Date().toJSON(),
      deletedAt: "",
    };

    if (!organization.parentId) {
      const childrens = JSON.parse(await this.getChildren(ctx, organization.parentId));
      if (childrens.length) throw new Error(`Root organization already exists`);
    }

    const organizationCreatedJson = JSON.stringify(sortKeysRecursive(organization));

    await ctx.stub.putState(organization.id, Buffer.from(organizationCreatedJson));

    return organizationCreatedJson;
  }

  @Transaction()
  @Returns("string")
  async update(ctx: Context, id: string, organizationJson: string) {
    const exist = await this.checkExist(ctx, id);

    if (!exist) throw new Error(`Organization with id ${id} does not exist`);

    const organizationPrev: Organization = JSON.parse(await this.getById(ctx, id));
    const organizationCur: Organization = JSON.parse(organizationJson);

    if (organizationCur.parentId) {
      const organizationParent: Organization = JSON.parse(await this.getById(ctx, organizationCur.parentId));
      if (organizationParent.parentId === organizationCur.id)
        throw new Error(`Can't accept organization's child as a father`);
    }

    const organization = {
      ...organizationPrev,
      ...organizationCur,
      updatedAt: new Date().toJSON(),
    };

    const organizationUpdatedJson = JSON.stringify(sortKeysRecursive(organization));

    await ctx.stub.putState(id, Buffer.from(organizationUpdatedJson));

    return organizationUpdatedJson;
  }

  private async deleteTreeRecursive(ctx: Context, organizations: Organization[], parentId: string) {
    const children = organizations.filter((org) => org.parentId === parentId);
    if (!children.length) return await ctx.stub.deleteState(parentId);

    for (const child of children) {
      await this.deleteTreeRecursive(ctx, organizations, child.id);
    }

    await ctx.stub.deleteState(parentId);
  }

  @Transaction()
  async delete(ctx: Context, id: string) {
    const exist = await this.checkExist(ctx, id);

    if (!exist) throw new Error(`Organization with id ${id} does not exist`);

    const organizations = JSON.parse(await this.getAll(ctx));

    await this.deleteTreeRecursive(ctx, organizations, id);
  }
}
