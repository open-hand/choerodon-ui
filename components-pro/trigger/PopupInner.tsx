import React, { StatelessComponent } from 'react';
import { ElementProps } from '../core/ViewComponent';

const PopupInner: StatelessComponent<ElementProps> = (props) => (
  <div {...props} />
);

export default PopupInner;
