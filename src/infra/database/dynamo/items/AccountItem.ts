import { Account } from "@aplication/entities/Account";

export class AccountItem {
  private readonly type = "Account";
  private readonly keys: AccountItem.Keys;

  constructor(private readonly attrs: AccountItem.Attributes) {
    this.keys = {
      PK: AccountItem.getPK(this.attrs.id),
      SK: AccountItem.getSK(this.attrs.id),
      GSI1PK: AccountItem.getGSI1PK(this.attrs.email),
      GSI1SK: AccountItem.getGSI1SK(this.attrs.email),
    };
  }

  toItem(): AccountItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: this.type,
    };
  }

  // Created this factory function to avoid creating an account in the AccountRepository file
  static fromEntity(account: Account) {
    return new AccountItem({
      ...account,
      createdAt: account.createdAt.toISOString(),
    });
  }

  static getPK(accountId: string): AccountItem.Keys["PK"] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): AccountItem.Keys["SK"] {
    return `ACCOUNT#${accountId}`;
  }

  static getGSI1PK(email: string): AccountItem.Keys["GSI1PK"] {
    return `ACCOUNT#${email}`;
  }

  static getGSI1SK(email: string): AccountItem.Keys["GSI1SK"] {
    return `ACCOUNT#${email}`;
  }
}

export namespace AccountItem {
  export type Keys = {
    // PK: string;
    // SK: string;
    // GSI1PK: string;
    // GSI1SK: string;
    // I commented them out so that I can highlight the changes below instead of type string
    // I will add `ACCOUNT#${string}` this means it is a string that has to follow the types in the static methods above
    // This will help avoid typos and will show red squiggly lines immediately
    PK: `ACCOUNT#${string}`;
    SK: `ACCOUNT#${string}`;
    GSI1PK: `ACCOUNT#${string}`;
    GSI1SK: `ACCOUNT#${string}`;
  };

  export type Attributes = {
    id: string;
    email: string;
    externalId: string;
    createdAt: string;
  };

  export type ItemType = Keys &
    Attributes & {
      type: "Account";
    };
}
