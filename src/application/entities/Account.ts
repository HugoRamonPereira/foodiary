import KSUID from "ksuid";
// KSUID - Key Sortable Unique Identifier

export class Account {
  readonly id: string;
  readonly email: string;
  externalId: string; // externalId will be mutable this is why I didn't add readonly to it
  readonly createdAt: Date;

  constructor(attr: Account.Attributes) {
    this.id = KSUID.randomSync().string;
    this.email = attr.email;
    this.externalId = attr.externalId;
    this.createdAt = new Date();
  }
}

export namespace Account {
  export type Attributes = {
    email: string;
    externalId: string;
  };
}
