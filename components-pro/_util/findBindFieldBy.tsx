import Field, { Fields } from '../data-set/Field';

export default function findBindFieldBy(
  myField: Field,
  fields: Fields,
  prop: string,
): Field | undefined {
  const value = myField.get(prop);
  const myName = myField.name;
  return [...fields.values()].find(field => {
    const bind = field.get('bind');
    return bind && bind === `${myName}.${value}`;
  });
}
