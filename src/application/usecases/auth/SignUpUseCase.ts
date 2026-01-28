import { Account } from "@aplication/entities/Account";
import { EmailAlreadyInUse } from "@aplication/errors/application/EmailAlreadyInUse";
import { AccountRepository } from "@infra/database/dynamo/repositories/AccountRepository";
import { AuthGateway } from "@infra/gateways/AuthGateway";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute({
    email,
    password,
  }: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    const emailAlreadyInUse = await this.accountRepository.findEmail(email);

    if (emailAlreadyInUse) {
      throw new EmailAlreadyInUse();
    }

    // This is where we only create the object in memory for a new account
    const account = new Account({ email });
    // Registered data in Cognito
    const { externalId } = await this.authGateway.signUp({
      email,
      password,
      internalId: account.id,
    });

    // Change the id for the one I obtained above
    account.externalId = externalId;
    // And only here I save it to the DynamoDB
    await this.accountRepository.create(account);

    const { accessToken, refreshToken } = await this.authGateway.signIn({
      email,
      password,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

export namespace SignUpUseCase {
  export type Input = {
    email: string;
    password: string;
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
