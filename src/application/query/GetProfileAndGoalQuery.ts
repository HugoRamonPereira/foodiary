import { Profile } from "@aplication/entities/Profile";
import { ResourceNotFound } from "@aplication/errors/application/ResourceNotFound";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "@infra/clients/dynamoClient";
import { AccountItem } from "@infra/database/dynamo/items/AccountItem";
import { GoalItem } from "@infra/database/dynamo/items/GoalItem";
import { ProfileItem } from "@infra/database/dynamo/items/ProfileItem";
import { Injectable } from "@kernel/decorators/Injectable";
import { AppConfig } from "@shared/config/AppConfig";

@Injectable()
export class GetProfileAndGoalQuery {
  constructor(private readonly config: AppConfig) {}

  async execute({
    accountId,
  }: GetProfileAndGoalQuery.Input): Promise<GetProfileAndGoalQuery.Output> {
    // PK = ACCOUNT#<$accountId>, SK = begins_with(ACCOUNT#<$accountId>#)
    const command = new QueryCommand({
      TableName: this.config.db.dynamodb.mainTable,
      // Limited to 2 registers: goal and profile
      Limit: 2,
      // ProjectionExpression are the exact fields I need, so I am telling this query what I want it to fetch in Dynamo
      ProjectionExpression:
        "#PK, #SK, #name, #birthDate, #gender, #height, #weight, #calories, #proteins, #carbohydrates, #fats, #type",
      KeyConditionExpression: "#PK = :PK AND begins_with(#SK, :SK)",
      ExpressionAttributeNames: {
        "#PK": "PK",
        "#SK": "SK",
        "#name": "name",
        "#birthDate": "birthDate",
        "#gender": "gender",
        "#height": "height",
        "#weight": "weight",
        "#calories": "calories",
        "#proteins": "proteins",
        "#carbohydrates": "carbohydrates",
        "#fats": "fats",
        "#type": "type",
      },
      ExpressionAttributeValues: {
        ":PK": AccountItem.getPK(accountId),
        ":SK": `${AccountItem.getPK(accountId)}#`,
      },
    });

    const { Items = [] } = await dynamoClient.send(command);

    // console.log(JSON.stringify({ Items }, null, 2));

    const profile = Items.find(
      (item): item is GetProfileAndGoalQuery.ProfileItemType =>
        item.type === ProfileItem.type,
    );

    const goal = Items.find(
      (item): item is GetProfileAndGoalQuery.GoalItemType =>
        item.type === GoalItem.type,
    );

    if (!profile || !goal) {
      throw new ResourceNotFound("Account not found!");
    }

    return {
      profile: {
        name: profile.name,
        birthDate: profile.birthDate,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
      },
      goal: {
        calories: goal.calories,
        carbohydrates: goal.carbohydrates,
        proteins: goal.proteins,
        fats: goal.fats,
      },
    };
  }
}

export namespace GetProfileAndGoalQuery {
  // Input here is what I need to get access to the data I need to show in the client, so I need the account ID
  export type Input = {
    accountId: string;
  };

  export type ProfileItemType = {
    name: string;
    birthDate: string;
    gender: Profile.Gender;
    height: number;
    weight: number;
  };

  export type GoalItemType = {
    calories: number;
    carbohydrates: number;
    fats: number;
    proteins: number;
  };

  // Output is the kind of data I have accessed through the account ID and that data is going to be outputted to the client,
  // But before we output it all we will filter what the frontend/interface/client needs to display
  // We do not need all of the data, we don't need the account id, date when the account was created, this kinda info are not necessary
  export type Output = {
    profile: {
      name: string;
      birthDate: string;
      gender: Profile.Gender;
      height: number;
      weight: number;
    };
    goal: {
      calories: number;
      carbohydrates: number;
      fats: number;
      proteins: number;
    };
  };
}
