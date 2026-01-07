import { Controller } from "@aplication/contracts/Controller";
import { HelloUseCase } from "@aplication/usecases/HelloUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { HelloBody, helloSchema } from "./schemas/helloSchema";

@Injectable()
@Schema(helloSchema)
export class HelloController extends Controller<unknown> {
  constructor(private readonly helloUseCase: HelloUseCase) {
    super();
  }
  protected override async handle(
    request: Controller.Request<HelloBody>
  ): Promise<Controller.Response<unknown>> {
    const result = await this.helloUseCase.execute({
      email: request.body.email,
    });
    return {
      statusCode: 200,
      body: {
        result,
      },
    };
  }
}
