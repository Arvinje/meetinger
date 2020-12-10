# Meetinger
> A Serverless Meetup management app, built with TypeScript to showcase Domain-Driven Design (DDD), Clean Architecture & SOLID best practices.

This started as an exercise for me to practice the principles of Domain-Driven Design in a TypeScript-written app. Additionally, I tried to up my game in DynamoDB single table design.

## The Stack
- A Serverless app, designed to be deployed on AWS infrastructure
- TypeScript on NodeJS
- DynamoDB as the primary database, with a single table design from the start
- Infrastructure configured via Terraform (IaC)
- Amazon Cognito for authentication

## How to deploy
First start by deploying the infrastructure using Terraform. In `infrastructure` directory, under the desired environment sub directory, simple run:

`terraform apply`

The Serverless stack can be deployed similarly by running `sls deploy` in `backend` directory.

## Road map
The work on this project is not done yet. Here are some things that I consider to implement in the future:

- [ ] Better error messages
- [ ] Expand the API to include more usecases
- [ ] Add a frontend

## Credits
This app is highly influenced by the articles and the SOLID book by [Khalil Stemmler](https://khalilstemmler.com). On this journey, I've also enjoyed many articles on practical DDD by [Vaughn Vernon](https://vaughnvernon.co).

## License
> Copyright (c) 2020 Arvin Jenabi (arvinjenabi.com)

Meetinger is released under [the MIT license](LICENSE).