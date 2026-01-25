import { Account } from "@aplication/entities/Account";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "@infra/clients/dynamoClient";
import { Injectable } from "@kernel/decorators/Injectable";
import { AppConfig } from "@shared/config/AppConfig";
import { AccountItem } from "../items/AccountItem";

@Injectable()
export class AccountRepository {
  constructor(private readonly config: AppConfig) {}

  async findEmail(email: string): Promise<Account | null> {
    const command = new QueryCommand({
      IndexName: "GSI1", //GSI1 comes from the file MainTable.yml inside GlobalSecondaryIndexes
      TableName: this.config.db.dynamodb.mainTable,
      Limit: 1, //This will tell AWS to stop querying once they find what they were told to
      KeyConditionExpression: "#GSI1PK = :GSI1PK AND #GSI1SK = :GSI1SK",
      ExpressionAttributeNames: {
        "#GSI1PK": "GSI1PK",
        "#GSI1SK": "GSI1SK",
      },
      ExpressionAttributeValues: {
        ":GSI1PK": AccountItem.getGSI1PK(email),
        ":GSI1SK": AccountItem.getGSI1SK(email),
      },
    });

    // Added Items = [] an empty array because it can be an array or undefined
    const { Items = [] } = await dynamoClient.send(command);
    // This line below shows how it could be destructured from an array the same from the line below it
    // const { Items: [account] = [] } = await dynamoClient.send(command);
    // const [account] = Items;
    const account = Items[0] as AccountItem.ItemType | undefined;

    if (!account) {
      return null;
    }

    return AccountItem.toEntity(account);
  }

  async create(account: Account): Promise<void> {
    const accountItem = AccountItem.fromEntity(account);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: accountItem.toItem(),
    });

    await dynamoClient.send(command);
  }
}
