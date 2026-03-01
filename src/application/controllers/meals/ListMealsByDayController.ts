import { Controller } from "@aplication/contracts/Controller";
import { Meal } from "@aplication/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { ListMealsByDayQuery } from "./../../query/ListMealsByDayQuery";
import { listMealsByDaySchema } from "./schemas/listMealsByDaySchema";

@Injectable()
export class ListMealsByDayController extends Controller<
  "private",
  ListMealsByDayController.Response
> {
  constructor(private readonly listMealsByDayQuery: ListMealsByDayQuery) {
    super();
  }

  protected override async handle({
    accountId,
    queryParams,
  }: Controller.Request<"private">): Promise<
    Controller.Response<ListMealsByDayController.Response>
  > {
    const { date } = listMealsByDaySchema.parse(queryParams);
    const { meals } = await this.listMealsByDayQuery.execute({
      accountId,
      date,
    });

    return {
      statusCode: 200,
      body: {
        meals,
      },
    };
  }
}

export namespace ListMealsByDayController {
  export type Response = {
    meals: {
      id: string;
      createdAt: string;
      name: string;
      icon: string;
      foods: Meal.Food[];
    }[];
  };
}
