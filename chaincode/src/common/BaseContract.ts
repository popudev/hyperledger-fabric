import { Context, Contract, Info, Returns, Transaction } from "fabric-contract-api";

export class BaseContract extends Contract {
  protected assetName: string;

  constructor(assetName: string) {
    super();
    this.assetName = assetName;
  }

  @Transaction(false)
  @Returns("string")
  async getById(ctx: Context, id: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`${this.assetName} with ${id} does not exist`);
    }
    return assetJSON.toString();
  }

  @Transaction(false)
  @Returns("string")
  async getAll(ctx: Context): Promise<string> {
    const allResults = [];

    const query = {
      selector: {
        docType: this.assetName,
        deletedAt: "",
      },
    };

    const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
    let result = await iterator.next();

    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString("utf8");
      let record: any;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }

    return JSON.stringify(allResults);
  }

  @Transaction(false)
  @Returns("boolean")
  async checkExist(ctx: Context, id: string) {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON && assetJSON.length > 0;
  }
}
