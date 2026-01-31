import { Controller } from "@aplication/contracts/Controller";
import { ForgotPasswordUseCase } from "@aplication/usecases/auth/ForgotPasswordUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import {
  ForgotPasswordBody,
  forgotPasswordSchema,
} from "./schemas/forgotPasswordSchema";

@Injectable()
@Schema(forgotPasswordSchema)
export class ForgotPasswordController extends Controller<
  "public",
  ForgotPasswordController.Response
> {
  constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {
    super();
  }
  protected override async handle({
    body,
  }: Controller.Request<"public", ForgotPasswordBody>): Promise<
    Controller.Response<ForgotPasswordController.Response>
  > {
    // Added this trycatch block cause we didnt see the need to write a new custom error for it
    // This feature of reset password is nothing that can cause harm to our app, so this is why we just used a BadRequest error
    try {
      const { email } = body;

      await this.forgotPasswordUseCase.execute({
        email,
      });
      // Left the catch block empty cause this is a route to reset password, password that was forgotten
      // If we leave error messages that can give hints to people with ill intentions of trying to find out what are the emails we have or not
      // by testing emails, then this person will only get a 204 No Content so he/she will never know by testing emails if the email was a right one
    } catch {}
    // If we add a BadRequest error or even a custom forgot password error then someone will test an email and if it works he will have a clue
    return {
      statusCode: 204,
    };
  }
}

export namespace ForgotPasswordController {
  export type Response = null;
}
