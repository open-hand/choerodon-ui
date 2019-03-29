import { Children } from 'react';

function mirror(o) {
  return o;
}

export default function mapSelf(children) {
  // return ReactFragment
  return Children.map(children, mirror);
}
