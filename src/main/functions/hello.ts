import "reflect-metadata";

import { HelloController } from "@aplication/controllers/HelloController";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { HelloUseCase } from "../../usecases/HelloUseCase";

const controller = new HelloController(new HelloUseCase());

export const handler = lambdaHttpAdapter(controller);
