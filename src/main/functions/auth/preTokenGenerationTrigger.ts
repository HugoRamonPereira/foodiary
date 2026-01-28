import { PreTokenGenerationV2TriggerEvent } from "aws-lambda";

export async function handler(event: PreTokenGenerationV2TriggerEvent) {
  // This is how we add a new prop to jwt, we can see the internalId and its value in the file
  // lambdaHttpAdapter in that if check for authorizer
  event.response = {
    claimsAndScopeOverrideDetails: {
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          // This is the prop we added, this is how we are going to identify the users of our project
          internalId: event.request.userAttributes["custom:internalId"] ?? "",
          // This satisfies the TypeScript compiler because the result is guaranteed to be a string, even if the attribute is missing.
          // internalId: event.request.userAttributes["custom:internalId"]!,
          // The Non-Null Assertion
          // If you are absolutely certain that every single user in your Cognito pool will have this custom attribute, you can use the ! operator.
        },
      },
    },
  };

  return event;
}
