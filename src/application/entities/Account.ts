import KSUID from "ksuid";
// KSUID - Key Sortable Unique Identifier

export class Account {
  readonly id: string;
  readonly email: string;
  externalId: string; // externalId will be mutable this is why I didn't add readonly to it
  readonly createdAt: Date;

  constructor(attr: Account.Attributes) {
    // for the id use attr.id if it doesnt exist then create a random one with KSUID... this is the fallback
    this.id = attr.id ?? KSUID.randomSync().string;
    this.email = attr.email;
    this.externalId = attr.externalId;
    // same as above here
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Account {
  export type Attributes = {
    email: string;
    externalId: string;
    // these 2 optional props were added for once I want to recover an account I dont need a new id or date/timestamp
    id?: string;
    createdAt?: Date;
  };
}
