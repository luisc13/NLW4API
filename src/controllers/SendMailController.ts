import { Response, Request } from "express";
import { getCustomRepository } from "typeorm";
import {resolve} from 'path';
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";
import { AppError } from "../errors/appError";


class SendMailController{

    async execute(request:Request, response:Response){
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveyRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({ email});

        if(!user){
            throw new AppError("User does not exists")
        }
        const survey = await surveyRepository.findOne({id: survey_id});

        if(!survey){
            throw new AppError("Survey does not exists")
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");


        const surveyUserAlreadyExits = await surveysUsersRepository.findOne({
            where: {user_id: user.id, value: null},
            relations: ["user", "survey"],
        });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
        }

        if(surveyUserAlreadyExits){
            variables.id = surveyUserAlreadyExits.id
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlreadyExits);
        }

        //Salvar as informações na tabela SurveyUsers
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id,
        });

        await surveysUsersRepository.save(surveyUser);
        //Enviar email para o usuario
        variables.id = surveyUser.id

        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);
    }
}

export {SendMailController}