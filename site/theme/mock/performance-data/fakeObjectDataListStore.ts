import faker from 'faker';

type User = {
  id: number;
  avartar: string;
  city: string;
  email: string;
  firstName: string;
  lastName: string;
  suffix: string;
  street: string;
  zipCode: string;
  date: Date;
  bs: string;
  catchPhrase: string;
  companyName: string;
  words: string;
  sentence: string;
}

export function createFakeRowObjectData(index: number): User {
  return {
    id: index,
    avartar: faker.image.avatar(),
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

export default function fakeObjectDataListStore(size: number): User[] {
  const dataList: User[] = [];
  for (let i = 0; i < size; i++) {
    dataList.push(createFakeRowObjectData(i + 1));
  }
  return dataList;
}
