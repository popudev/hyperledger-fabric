import { Object, Property } from "fabric-contract-api";

@Object()
export class CreateOrganizationDTO {
  @Property() name: string;
  @Property() parentId: string;
}

@Object()
export class Organization {
  @Property() docType: string;
  @Property() id: string;
  @Property() name: string;
  @Property() parentId: string;
  @Property() createdAt: string;
  @Property() updatedAt: string;
  @Property() deletedAt: string;
}

@Object()
export class OrganizationTree {
  @Property() id: string;
  @Property() name: string;
  @Property() children: OrganizationTree[];
}
