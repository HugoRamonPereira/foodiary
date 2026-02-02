import ForgotPassword from "@infra/emails/templates/ForgotPassword";
import { render } from "@react-email/render";
import { CustomMessageTriggerEvent } from "aws-lambda";

export async function handler(event: CustomMessageTriggerEvent) {
  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    const confirmationCode = event.request.codeParameter;

    // this html is the ForgotPassword that is a component that renders our email template
    // we did this so that we didn't have to use <ForgotPassword /> like that and be forced to change the name
    // of this file customMessageTrigger.ts to customMessageTrigger.tsx
    // so all react components are functions so we passed it to the render method and also the confirmation code
    const html = await render(ForgotPassword({ confirmationCode }));

    event.response.emailSubject = "🍏 foodiary | Recover your account!";
    event.response.emailMessage = html;
  }

  return event;
}
