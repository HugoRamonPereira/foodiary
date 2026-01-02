import { APIGatewayProxyEventV2 } from "aws-lambda";

export function lambdaBodyParser(body: APIGatewayProxyEventV2["body"]) {
  try {
    if (!body) {
      return {};
    }
    return JSON.parse(body);
  } catch (error) {
    throw new Error("Body in an incorrect format");
  }
}
