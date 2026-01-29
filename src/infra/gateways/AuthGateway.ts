import {
  GetTokensFromRefreshTokenCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "@infra/clients/cognitoClient";
import { Injectable } from "@kernel/decorators/Injectable";
import { AppConfig } from "@shared/config/AppConfig";
import { createHmac } from "node:crypto";

@Injectable()
export class AuthGateway {
  constructor(private readonly appConfig: AppConfig) {}

  async signIn({
    email,
    password,
  }: AuthGateway.SignInParams): Promise<AuthGateway.SignInResult> {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: this.appConfig.auth.cognito.client.id,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: this.getSecretHash(email),
      },
    });

    const { AuthenticationResult } = await cognitoClient.send(command);

    // This is is known as a guard, without this check the return below it would have failed because the values could
    // be a string or undefined and by checking with an if it works fine
    if (
      !AuthenticationResult?.AccessToken ||
      !AuthenticationResult.RefreshToken
    ) {
      throw new Error(`Couldn't authenticate user ${email}`);
    }

    return {
      accessToken: AuthenticationResult?.AccessToken,
      refreshToken: AuthenticationResult?.RefreshToken,
    };
  }

  async signUp({
    email,
    password,
    internalId,
  }: AuthGateway.SignUpParams): Promise<AuthGateway.SignUpResult> {
    const command = new SignUpCommand({
      ClientId: this.appConfig.auth.cognito.client.id,
      Username: email,
      Password: password,
      // This is where I get the internalId, had to use custom:internalId due to Cognito naming convention
      UserAttributes: [{ Name: "custom:internalId", Value: internalId }],
      SecretHash: this.getSecretHash(email),
    });

    const { UserSub: externalId } = await cognitoClient.send(command);

    // externalId in the return down below had an error that it could be a string or undefined
    // that is why I added this if
    if (!externalId) {
      throw new Error(`Cannot signup the user: ${email}`);
      // This error will show in CloudWatch, it is being consoled in lambdaHttpAdapter.ts file
    }

    return {
      externalId,
    };
  }

  // Refresh Token Rotation is already enabled in the file UserPool.yml inside the UserPoolClient
  async refreshToken({
    refreshToken,
  }: AuthGateway.RefreshTokenParams): Promise<AuthGateway.RefreshTokenResult> {
    const command = new GetTokensFromRefreshTokenCommand({
      ClientId: this.appConfig.auth.cognito.client.id,
      RefreshToken: refreshToken,
      ClientSecret: this.appConfig.auth.cognito.client.secret,
    });

    const { AuthenticationResult } = await cognitoClient.send(command);

    // This is is known as a guard, without this check the return below it would have failed because the values could
    // be a string or undefined and by checking with an if it works fine
    if (
      !AuthenticationResult?.AccessToken ||
      !AuthenticationResult.RefreshToken
    ) {
      throw new Error("Couldn't refresh the token");
    }

    return {
      accessToken: AuthenticationResult?.AccessToken,
      refreshToken: AuthenticationResult?.RefreshToken,
    };
  }

  private getSecretHash(email: string): string {
    // Base64 (HMAC_SHA256 ( "Client Secret Key", "Username" + "Client Id"))
    // Used createHmac from node:crypto to generate the HMAC in SHA256 format to satisfy AWS Cognito
    // HMAC (Hash-based Message Authentication Code) is a specific way of using a hash function (like SHA-256) combined with a secret key.
    // SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic hash function.
    const { id, secret } = this.appConfig.auth.cognito.client;
    // Create this variable above just to destructure the values id and secret

    return createHmac("SHA256", secret)
      .update(`${email}${id}`)
      .digest("base64");
  }
}

export namespace AuthGateway {
  export type SignUpParams = {
    email: string;
    password: string;
    internalId: string; // Added internalId so that we can get it without having to make a request/query to DB
  };

  export type SignUpResult = {
    externalId: string;
  };

  export type SignInParams = {
    email: string;
    password: string;
  };

  export type SignInResult = {
    accessToken: string;
    refreshToken: string;
  };

  export type RefreshTokenParams = {
    refreshToken: string;
  };

  export type RefreshTokenResult = {
    accessToken: string;
    refreshToken: string;
  };
}
