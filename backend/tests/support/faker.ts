import faker from 'faker';

const SEED = Number(process.env.FAKER_SEED) || Math.floor(Math.random() * 1000);
// eslint-disable-next-line no-console
console.log(`Faker.js seed is set to ${SEED}`);
faker.seed(SEED);

export default faker;
