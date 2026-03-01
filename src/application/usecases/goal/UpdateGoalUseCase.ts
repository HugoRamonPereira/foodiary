import { ResourceNotFound } from "@aplication/errors/application/ResourceNotFound";
import { GoalRepository } from "@infra/database/dynamo/repositories/GoalRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class UpdateGoalUseCase {
  constructor(private readonly goalRepository: GoalRepository) {}

  async execute({
    accountId,
    calories,
    proteins,
    carbohydrates,
    fats,
  }: UpdateGoalUseCase.Input): Promise<UpdateGoalUseCase.Output> {
    const goal = await this.goalRepository.findByAccountId(accountId);

    if (!goal) {
      throw new ResourceNotFound("Goal not found!");
    }

    goal.calories = calories;
    goal.proteins = proteins;
    goal.carbohydrates = carbohydrates;
    goal.fats = fats;

    // This is where I save the updated profile info
    await this.goalRepository.save(goal);
  }
}

export namespace UpdateGoalUseCase {
  export type Input = {
    accountId: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
  };

  export type Output = void;
}
