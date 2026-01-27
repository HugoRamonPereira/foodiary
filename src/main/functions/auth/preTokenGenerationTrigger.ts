import { PreTokenGenerationV2TriggerEvent } from "aws-lambda";

export async function handler(event: PreTokenGenerationV2TriggerEvent) {
  // This is how we add a new prop to jwt, we can see the internalId and its value in the file
  // lambdaHttpAdapter in that if check for authorizer
  event.response = {
    claimsAndScopeOverrideDetails: {
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          // This is the prop we added, this is how we are going to identify the users of our project
          internalId: ",smdhfbgdhf",
        },
      },
    },
  };

  return event;
}
