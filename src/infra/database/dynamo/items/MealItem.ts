import { Meal } from "@aplication/entities/Meal";

export class MealItem {
  static readonly type = "Meal";
  private readonly keys: MealItem.Keys;

  constructor(private readonly attrs: MealItem.Attributes) {
    this.keys = {
      PK: MealItem.getPK(this.attrs.id),
      SK: MealItem.getSK(this.attrs.id),
      GSI1PK: MealItem.getGSI1PK({
        accountId: this.attrs.accountId,
        createdAt: new Date(this.attrs.createdAt),
      }),
      GSI1SK: MealItem.getGSI1SK(this.attrs.id),
    };
  }

  toItem(): MealItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: MealItem.type,
    };
  }

  // Created this factory function to avoid creating a meal
  // fromEntity creates an Meal Item from an Entity
  static fromEntity(meal: Meal) {
    return new MealItem({
      ...meal,
      inputFileKey: meal.inputFileKey ?? "",
      createdAt: meal.createdAt.toISOString(),
    });
  }
  // static fromEntity(meal: Meal) {
  //   return new MealItem({
  //     id: meal.id,
  //     accountId: meal.accountId,
  //     status: meal.status,
  //     attempts: meal.attempts,
  //     inputType: meal.inputType,
  //     inputFileKey: meal.inputFileKey,
  //     name: meal.name,
  //     icon: meal.icon,
  //     foods: meal.foods,
  //     createdAt: meal.createdAt.toISOString(),
  //   });
  // }

  // Created this factory function to avoid creating an account in the AccountRepository file
  // here in toEntity we create an Entity from an Account Item
  static toEntity(mealItem: MealItem.ItemType) {
    return new Meal({
      id: mealItem.id,
      accountId: mealItem.accountId,
      attempts: mealItem.attempts,
      foods: mealItem.foods,
      icon: mealItem.icon,
      inputFileKey: mealItem.inputFileKey,
      inputType: mealItem.inputType,
      name: mealItem.name,
      status: mealItem.status,
      createdAt: new Date(mealItem.createdAt),
    });
  }

  static getPK(mealId: string): MealItem.Keys["PK"] {
    return `MEAL#${mealId}`;
  }

  static getSK(mealId: string): MealItem.Keys["SK"] {
    return `MEAL#${mealId}`;
  }

  static getGSI1PK({
    accountId,
    createdAt,
  }: MealItem.GSIPKParams): MealItem.Keys["GSI1PK"] {
    const year = createdAt.getFullYear();
    const month = String(createdAt.getMonth() + 1).padStart(2, "0");
    const day = String(createdAt.getDate()).padStart(2, "0");
    return `MEALS#${accountId}#${year}-${month}-${day}`;
  }

  static getGSI1SK(mealId: string): MealItem.Keys["GSI1SK"] {
    return `MEAL#${mealId}`;
  }
}

export namespace MealItem {
  export type Keys = {
    // PK: string;
    // SK: string;
    // GSI1PK: string;
    // GSI1SK: string;
    // I commented them out so that I can highlight the changes below instead of type string
    // I will add `ACCOUNT#${string}` this means it is a string that has to follow the types in the static methods above
    // This will help avoid typos and will show red squiggly lines immediately
    PK: `MEAL#${string}`;
    SK: `MEAL#${string}`;
    GSI1PK: `MEALS#${string}#${string}-${string}-${string}`;
    GSI1SK: `MEAL#${string}`;
  };

  export type Attributes = {
    id: string;
    accountId: string;
    status: Meal.Status;
    attempts: number;
    inputType: Meal.InputType;
    inputFileKey: string;
    name: string;
    icon: string;
    foods: Meal.Food[];
    createdAt: string;
  };

  export type ItemType = Keys &
    Attributes & {
      type: "Meal";
    };

  export type GSIPKParams = {
    accountId: string;
    createdAt: Date;
  };
}
