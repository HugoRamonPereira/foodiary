import { Goal } from "@aplication/entities/Goal";
import { AccountItem } from "./AccountItem";

export class GoalItem {
  private readonly type = "Goal";
  private readonly keys: GoalItem.Keys;

  constructor(private readonly attrs: GoalItem.Attributes) {
    this.keys = {
      PK: GoalItem.getPK(this.attrs.accountId),
      SK: GoalItem.getSK(this.attrs.accountId),
    };
  }

  toItem(): GoalItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: this.type,
    };
  }

  // Created this factory function to avoid creating an account in the AccountRepository file
  // fromEntity creates an Account Item from an Entity
  // static fromEntity(account: Account) {
  //   return new GoalItem({
  //     ...account,
  //     createdAt: account.createdAt.toISOString(),
  //   });
  // }
  static fromEntity(goal: Goal) {
    return new GoalItem({
      // This is how it was, I made a copy of the AccountItem
      // id: account.id,
      // email: account.email,
      // externalId: account.externalId ?? undefined, // Standardizes the value
      // createdAt: account.createdAt.toISOString(),
      ...goal,
      // Transoformed creatdAt and birthDate are Date object in the accountItem but here it has to be isoString because of DynamoDB,
      // We do not save Date objects in DynamoDB
      createdAt: goal.createdAt.toISOString(),
    });
  }

  // Created this factory function to avoid creating an account in the AccountRepository file
  // here in toEntity we create an Entity from an Account Item
  static toEntity(goalItem: GoalItem.ItemType) {
    return new Goal({
      accountId: goalItem.accountId,
      calories: goalItem.calories,
      proteins: goalItem.proteins,
      carbohydrates: goalItem.carbohydrates,
      fats: goalItem.fats,
      createdAt: new Date(goalItem.createdAt),
    });
  }

  static getPK(accountId: string): GoalItem.Keys["PK"] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): GoalItem.Keys["SK"] {
    return `ACCOUNT#${accountId}#GOAL`;
  }
}

export namespace GoalItem {
  export type Keys = {
    // PK: string;
    // SK: string;
    // GSI1PK: string;
    // GSI1SK: string;
    // I commented them out so that I can highlight the changes below instead of type string
    // I will add `ACCOUNT#${string}` this means it is a string that has to follow the types in the static methods above
    // This will help avoid typos and will show red squiggly lines immediately
    // PK: `ACCOUNT#${string}`;
    PK: AccountItem.Keys["PK"];
    SK: `ACCOUNT#${string}#GOAL`;
  };

  export type Attributes = {
    accountId: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    createdAt: string;
  };

  export type ItemType = Keys &
    Attributes & {
      type: "Goal";
    };
}
