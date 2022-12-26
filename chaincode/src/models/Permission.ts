import { Object, Property } from "fabric-contract-api";

@Object()
export class Permission {
  @Property() docType: string;
  @Property() id: string;
  @Property() name: string;
  @Property() code: string;
  @Property() createdAt: string;
  @Property() updatedAt: string;
  @Property() deletedAt: string;
}

@Object()
export class CreatePermissionDTO {
  @Property() name: string;
  @Property() code: string;
}
