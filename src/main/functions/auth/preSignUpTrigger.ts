import { PreSignUpTriggerEvent } from "aws-lambda";

// This is where the moment I create an account it will verify the user and the email and login automatically
export async function handler(event: PreSignUpTriggerEvent) {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  return event;
}
