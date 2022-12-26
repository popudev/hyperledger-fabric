import { Object, Property } from "fabric-contract-api";

@Object()
export class Role {
  @Property() docType: string;
  @Property() id: string;
  @Property() name: string;
  @Property() permissionIds: string[];
  @Property() createdAt: string;
  @Property() updatedAt: string;
  @Property() deletedAt: string;
}

@Object()
export class CreateRoleDTO {
  @Property() name: string;
  @Property() permissionIds: string[];
}
