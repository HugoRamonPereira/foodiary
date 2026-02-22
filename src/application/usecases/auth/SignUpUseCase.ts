import { Account } from "@aplication/entities/Account";
import { Goal } from "@aplication/entities/Goal";
import { Profile } from "@aplication/entities/Profile";
import { EmailAlreadyInUse } from "@aplication/errors/application/EmailAlreadyInUse";
import { AccountRepository } from "@infra/database/dynamo/repositories/AccountRepository";
import { SignUpUnitOfWork } from "@infra/database/dynamo/uow/SignUpUnitOfWork";
import { AuthGateway } from "@infra/gateways/AuthGateway";
import { Injectable } from "@kernel/decorators/Injectable";
import { Saga } from "@shared/saga/saga";

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
    private readonly signUpUow: SignUpUnitOfWork,
    private readonly saga: Saga,
  ) {}

  async execute({
    account: { email, password },
    profile: profileInfo,
  }: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    return this.saga.run(async () => {
      const emailAlreadyInUse = await this.accountRepository.findEmail(email);

      if (emailAlreadyInUse) {
        throw new EmailAlreadyInUse();
      }

      // This is where we only create the object in memory for a new account
      const account = new Account({ email });
      const profile = new Profile({
        ...profileInfo,
        accountId: account.id,
      });
      const goal = new Goal({
        accountId: account.id,
        calories: 2000,
        proteins: 25,
        fats: 200,
        carbohydrates: 1200,
      });

      // Registered data in Cognito
      console.log(">>> Creating user in Cognito...");
      const { externalId } = await this.authGateway.signUp({
        email,
        password,
        internalId: account.id,
      });

      this.saga.addCompensation(async () => {
        console.log(">>> Deleting user from Cognito...");
        return this.authGateway.deleteUser({ externalId });
      });

      // Change the id for the one I obtained above
      account.externalId = externalId;

      console.log(">>> Saving user to the database...");
      await this.signUpUow.run({
        account,
        goal,
        profile,
      });

      // And only here I save it to the DynamoDB
      // This was how it was, but I added profile and goals later this is why I added this promise.all
      // await this.accountRepository.create(account);

      // Removed this Promise.all due to the fact that it is firing 3 requests at once, in AWS Dynamo we pay per requests
      // and also in AWS Lambda we pay per time of execution
      // await Promise.all([
      //   this.accountRepository.create(account),
      //   this.profileRepository.create(profile),
      //   this.goalRepository.create(goal),
      // ]);
      // Removed the Promise.all because of the code above with signUpUow Unit Of Work with the method Run. Which is atomic code.

      const { accessToken, refreshToken } = await this.authGateway.signIn({
        email,
        password,
      });

      return {
        accessToken,
        refreshToken,
      };
    });
  }
}

export namespace SignUpUseCase {
  export type Input = {
    account: {
      email: string;
      password: string;
    };
    profile: {
      name: string;
      birthDate: Date;
      gender: Profile.Gender;
      height: number;
      weight: number;
      activityLevel: Profile.ActivityLevel;
    };
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
