import { Meal } from "@aplication/entities/Meal";
import { ResourceNotFound } from "@aplication/errors/application/ResourceNotFound";
import { MealRepository } from "@infra/database/dynamo/repositories/MealRepository";
import { MealsFileStorageGateway } from "@infra/gateways/MealsFileStorageGateway";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class GetMealByIdUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealsFileStorageGateway: MealsFileStorageGateway,
  ) {}

  async execute({
    accountId,
    mealId,
  }: GetMealByIdUseCase.Input): Promise<GetMealByIdUseCase.Output> {
    const meal = await this.mealRepository.findById({ accountId, mealId });

    if (!meal) {
      throw new ResourceNotFound("Meal not found!");
    }

    const inputFileURL = this.mealsFileStorageGateway.getFileUrl(
      meal.inputFileKey!,
    );

    return {
      meal: {
        id: meal.id,
        status: meal.status,
        inputType: meal.inputType,
        inputFileURL,
        name: meal.name,
        foods: meal.foods,
        createdAt: meal.createdAt,
        icon: meal.icon,
      },
    };
  }
}

export namespace GetMealByIdUseCase {
  export type Input = {
    accountId: string;
    mealId: string;
  };

  export type Output = {
    meal: {
      id: string;
      status: Meal.Status;
      inputType: Meal.InputType;
      inputFileURL?: string;
      name: string;
      icon: string;
      foods: Meal.Food[];
      createdAt: Date;
    };
  };
}
