import { getSchema } from "@kernel/decorators/Schema";

export abstract class Controller<TResponse = unknown, TRequest = any> {
  protected abstract handle(
    request: Controller.Request<TRequest>
  ): Promise<Controller.Response<TResponse>>;

  public execute(
    request: Controller.Request<TRequest>
  ): Promise<Controller.Response<TResponse>> {
    const body = this.validateBody(request.body);

    return this.handle({
      ...request,
      body,
    });
  }

  private validateBody(body: unknown): TRequest {
    const schema = getSchema(this);
    if (!schema) {
      return body as TRequest;
    }

    return schema.parse(body) as TRequest;
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
