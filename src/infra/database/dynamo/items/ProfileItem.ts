import { Profile } from "@aplication/entities/Profile";
import { AccountItem } from "./AccountItem";

export class ProfileItem {
  private readonly type = "Profile";
  private readonly keys: ProfileItem.Keys;

  constructor(private readonly attrs: ProfileItem.Attributes) {
    this.keys = {
      PK: ProfileItem.getPK(this.attrs.accountId),
      SK: ProfileItem.getSK(this.attrs.accountId),
    };
  }

  toItem(): ProfileItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: this.type,
    };
  }

  // Created this factory function to avoid creating an account in the AccountRepository file
  // fromEntity creates an Account Item from an Entity
  // static fromEntity(account: Account) {
  //   return new ProfileItem({
  //     ...account,
  //     createdAt: account.createdAt.toISOString(),
  //   });
  // }
  static fromEntity(profile: Profile) {
    return new ProfileItem({
      // This is how it was, I made a copy of the AccountItem
      // id: account.id,
      // email: account.email,
      // externalId: account.externalId ?? undefined, // Standardizes the value
      // createdAt: account.createdAt.toISOString(),
      ...profile,
      // Transoformed creatdAt and birthDate are Date object in the accountItem but here it has to be isoString because of DynamoDB,
      // We do not save Date objects in DynamoDB
      createdAt: profile.createdAt.toISOString(),
      birthDate: profile.birthDate.toISOString(),
    });
  }

  // Created this factory function to avoid creating an account in the AccountRepository file
  // here in toEntity we create an Entity from an Account Item
  static toEntity(profileItem: ProfileItem.ItemType) {
    return new Profile({
      accountId: profileItem.accountId,
      activityLevel: profileItem.activityLevel,
      birthDate: new Date(profileItem.birthDate),
      name: profileItem.name,
      gender: profileItem.gender,
      height: profileItem.height,
      weight: profileItem.weight,
      createdAt: new Date(profileItem.createdAt),
    });
  }

  static getPK(accountId: string): ProfileItem.Keys["PK"] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): ProfileItem.Keys["SK"] {
    return `ACCOUNT#${accountId}#PROFILE`;
  }
}

export namespace ProfileItem {
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
    SK: `ACCOUNT#${string}#PROFILE`;
  };

  export type Attributes = {
    accountId: string;
    name: string;
    birthDate: string;
    gender: Profile.Gender;
    height: number;
    weight: number;
    activityLevel: Profile.ActivityLevel;
    createdAt: string;
  };

  export type ItemType = Keys &
    Attributes & {
      type: "Profile";
    };
}
