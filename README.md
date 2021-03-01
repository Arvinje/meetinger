# Meetinger

[![CI](https://github.com/Arvinje/meetinger/actions/workflows/CI.yml/badge.svg)](https://github.com/Arvinje/meetinger/actions/workflows/CI.yml)

> A Serverless Meetup management app, built with TypeScript to showcase Domain-Driven Design (DDD), Clean Architecture & SOLID best practices.

This started as an exercise for me to practice the principles of Domain-Driven Design in a TypeScript-written app. Additionally, I tried to up my game in DynamoDB single table design.

## The Stack
- A Serverless app, designed to be deployed on AWS infrastructure
- TypeScript on NodeJS
- DynamoDB as the primary database, with a single table design from the start
- Infrastructure configured via Terraform (IaC)
- Amazon Cognito for authentication
- Amazon Simple Notification Service (SNS) as the message broker service
- Amazon Simple Queue Service (SQS) for message queues
- Amazon Simple Email Service (SES) for transactional emails

## How to deploy
First start by deploying the infrastructure using Terraform. In `infrastructure` directory, under the desired environment sub directory, simply run:

`terraform init && terraform apply`

The Serverless stack can be deployed similarly by running `sls deploy` in `backend` directory.

## Testing
Simply run `yarn test` in the `backend` directory to run all automated tests. This code base utilizes auto-generated fake data for testing using Faker.js. Faker.js supports configurable seed number which can be used to achieve consistent result. You can use `FAKER_SEED` environment variable to set your own seed. e.g. `FAKER_SEED=123 yarn test`

## Roadmap
The work on this project is not done yet. Here are some things that I consider to implement in the future:

- [ ] Better error messages
- [ ] Expand the API to include more usecases
- [ ] Add a frontend

## Credits
This app is highly influenced by the articles and the SOLID book by [Khalil Stemmler](https://khalilstemmler.com). On this journey, I've also enjoyed many articles on practical DDD by [Vaughn Vernon](https://vaughnvernon.co).

## License
> Copyright (c) 2020 Arvin Jenabi (arvinjenabi.com)

Meetinger is released under [the MIT license](LICENSE).