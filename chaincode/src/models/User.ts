import { Object, Property } from "fabric-contract-api";

@Object()
export class User {
  @Property() docType: string;
  @Property() id: string;
  @Property() fullName: string;
  @Property() gender: string;
  @Property() birthday: string;
  @Property() idCard: string;
  @Property() address: string;
  @Property() phone: string;
  @Property() role: string;
  @Property() createdAt: string;
  @Property() updatedAt: string;
  @Property() deletedAt: string;
}

@Object()
export class CreateUserDTO {
  @Property() fullName: string;
  @Property() gender: string;
  @Property() birthday: string;
  @Property() idCard: string;
  @Property() address: string;
  @Property() phone: string;
  @Property() role: string;
}
