import z from "zod";
import { getSchema } from "../../kernel/decorators/Schema";

export abstract class Controller<TBody = unknown> {
  // protected schema?: z.ZodSchema<TBody>;

  protected abstract handle(
    request: Controller.Request<TBody>
  ): Promise<Controller.Response<TBody>>;

  public execute(
    request: Controller.Request<TBody>
  ): Promise<Controller.Response<TBody>> {
    const body = this.validateBody(request.body);

    return this.handle({
      ...request,
      body,
    });
  }

  // private validateBody(body:Controller.Request["body"]) {
  //   const schema = getSchema(this);
  //   if (!schema) {
  //     return body;
  //   }

  //   return schema.parse(body);
  // }

  private validateBody(body: unknown): TBody {
    const schema = getSchema(this);
    if (!schema) {
      return body as TBody;
    }

    return schema.parse(body) as TBody;
  }
}

export namespace Controller {
  export type Request<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>
  > = {
    body: TBody;
    params: TParams;
    queryParams: TQueryParams;
  };

  export type Response<TBody = undefined> = {
    statusCode: number;
    body?: TBody;
  };
}
