import { getSchema } from "@kernel/decorators/Schema";

type TRouteType = "public" | "private";

export abstract class Controller<
  TType extends TRouteType,
  TResponse = unknown,
  TRequest = any,
> {
  protected abstract handle(
    request: Controller.Request<TType, TRequest>,
  ): Promise<Controller.Response<TResponse>>;

  public execute(
    request: Controller.Request<TType, TRequest>,
  ): Promise<Controller.Response<TResponse>> {
    const body = this.validateBody(request.body);

    return this.handle({
      ...request,
      body,
    });
  }

  // This is how it was, not really sure we need to change TRequest
  // private validateBody(body: unknown): TRequest {
  //   const schema = getSchema(this);
  //   if (!schema) {
  //     return body as TRequest;
  //   }

  //   return schema.parse(body) as TRequest;
  // }
  private validateBody(body: unknown): TType | TRequest {
    const schema = getSchema(this);
    if (!schema) {
      return body as TRequest;
    }

    return schema.parse(body) as TRequest;
  }
}

export namespace Controller {
  type BaseRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = {
    body: TBody;
    params: TParams;
    queryParams: TQueryParams;
  };

  // Created the types PublicRequest and PrivateRequest so that we can identify with the strings passed and specify
  // the type of the accountId whether it is null or a string
  type PublicRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    accountId: null; // This type was added to satisfy the response of the lambdaHttpAdapter file
  };

  type PrivateRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    accountId: string; // This type was added to satisfy the response of the lambdaHttpAdapter file
  };

  export type Request<
    TType extends TRouteType,
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = TType extends "public"
    ? PublicRequest<TBody, TParams, TQueryParams>
    : PrivateRequest<TBody, TParams, TQueryParams>;

  export type Response<TBody = undefined> = {
    statusCode: number;
    body?: TBody;
  };
}
