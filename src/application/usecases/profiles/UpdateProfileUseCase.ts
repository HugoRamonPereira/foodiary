import { Profile } from "@aplication/entities/Profile";
import { ResourceNotFound } from "@aplication/errors/application/ResourceNotFound";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute({
    accountId,
    name,
    birthDate,
    gender,
    height,
    weight,
  }: UpdateProfileUseCase.Input): Promise<UpdateProfileUseCase.Output> {
    const profile = await this.profileRepository.findByAccountId(accountId);

    if (!profile) {
      throw new ResourceNotFound("Profile not found!");
    }

    // This is where I can update the profile info
    profile.name = name;
    profile.birthDate = birthDate;
    profile.gender = gender;
    profile.height = height;
    profile.weight = weight;

    // This is where I save the updated profile info
    await this.profileRepository.save(profile);
  }
}

export namespace UpdateProfileUseCase {
  export type Input = {
    accountId: string;
    name: string;
    birthDate: Date;
    gender: Profile.Gender;
    height: number;
    weight: number;
  };

  export type Output = void;
}
