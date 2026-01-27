import {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { ZodError } from "zod";

import { Controller } from "@aplication/contracts/Controller";
import { ApplicationError } from "@aplication/errors/application/ApplicationError";
import { ErrorCode } from "@aplication/errors/ErrorCode";
import { HttpError } from "@aplication/errors/http/HttpError";
import { lambdaBodyParser } from "@main/utils/lambdaBodyParser";
import { lambdaErrorResponse } from "@main/utils/lambdaErrorResponse";

type Event = APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer;

export function lambdaHttpAdapter(controller: Controller<unknown>) {
  return async (event: Event): Promise<APIGatewayProxyResultV2> => {
    try {
      const body = lambdaBodyParser(event.body);
      const params = event.pathParameters ?? {};
      const queryParams = event.queryStringParameters ?? {};

      // Added APIGatewayProxyEventV2WithJWTAuthorizer to the type Event above so that it can show the prop
      // authorizer in the lines below and have access to jwt and claims
      if ("authorizer" in event.requestContext) {
        console.log(
          JSON.stringify(
            event.requestContext.authorizer.jwt.claims.internalId,
            null,
            2,
          ),
        );
      }

      const response = await controller.execute({
        body,
        params,
        queryParams,
      });

      return {
        statusCode: response.statusCode,
        body: response.body ? JSON.stringify(response.body) : undefined,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return lambdaErrorResponse({
          statusCode: 400,
          code: ErrorCode.VALIDATION,
          message: error.issues.map((issue) => ({
            field: issue.path.join("."),
            error: issue.message,
          })),
        });
      }

      if (error instanceof HttpError) {
        return lambdaErrorResponse(error);
      }

      // Had to create an object because the Application Errors do not have a statusCode, this is why I am sending a direct 400
      // without specifying a error.statusCode because it does not exist
      if (error instanceof ApplicationError) {
        return lambdaErrorResponse({
          // statusCode is saying that if there is a statusCode then show it otherwise show a 400
          statusCode: error.statusCode ?? 400,
          code: error.code,
          message: error.message,
        });
      }

      // This is error will show in CloudWatch
      console.log(error);

      return lambdaErrorResponse({
        statusCode: 500,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
    }
  };
}
