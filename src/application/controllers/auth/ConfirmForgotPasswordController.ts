import { Controller } from "@aplication/contracts/Controller";
import { BadRequest } from "@aplication/errors/http/BadRequest";
import { ConfirmForgotPasswordUseCase } from "@aplication/usecases/auth/ConfirmForgotPasswordUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import {
  ConfirmForgotPasswordBody,
  confirmForgotPasswordSchema,
} from "./schemas/confirmForgotPasswordSchema";

@Injectable()
@Schema(confirmForgotPasswordSchema)
export class ConfirmForgotPasswordController extends Controller<
  "public",
  ConfirmForgotPasswordController.Response
> {
  constructor(
    private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase,
  ) {
    super();
  }
  protected override async handle({
    body,
  }: Controller.Request<"public", ConfirmForgotPasswordBody>): Promise<
    Controller.Response<ConfirmForgotPasswordController.Response>
  > {
    try {
      const { email, confirmationCode, password } = body;

      await this.confirmForgotPasswordUseCase.execute({
        email,
        confirmationCode,
        password,
      });
      return {
        statusCode: 204,
      };
    } catch {
      throw new BadRequest("Operation failed. Try again!");
    }
  }
}

export namespace ConfirmForgotPasswordController {
  export type Response = null;
}
