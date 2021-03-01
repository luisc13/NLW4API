import { Response, Request } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/appError";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";


class AnswerController{

    async execute(request: Request, response: Response){
     const{value} = request.params;
     const {u} = request.query;

     const surveyUsersRepository = getCustomRepository(SurveysUsersRepository);

     const surveyUser = await surveyUsersRepository.findOne({
         id: String(u)
     });

     if(!surveyUser){
        throw new AppError("Survey user does not exists!")
     }
     surveyUser.value = Number(value);

     await surveyUsersRepository.save(surveyUser);

     return response.json(surveyUser);

    }
}

export {AnswerController}