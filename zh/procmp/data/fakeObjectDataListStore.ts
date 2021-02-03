const faker = require('faker');

export function createFakeRowObjectData(index) {
  return {
    id: index,
    avartar: 'https://imgchr.com/i/NOXKgg',
    city: faker.address.city(),
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    suffix: faker.name.suffix(),
    street: faker.address.streetName(),
    zipCode: faker.address.zipCode(),
    date: faker.date.past(),
    bs: faker.company.bs(),
    catchPhrase: faker.company.catchPhrase(),
    companyName: faker.company.companyName(),
    words: faker.lorem.words(),
    sentence: faker.lorem.sentence(),
  };
}

export default function fakeObjectDataListStore(size) {
  const dataList = [];
  for (let i = 0; i < size; i++) {
    // @ts-ignore
    dataList.push(createFakeRowObjectData(i + 1));
  }
  return dataList;
}
