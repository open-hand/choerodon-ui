import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';

export interface TableColProps extends ElementProps {
  width?: number | string;
  minWidth?: number | string;
}

export default class TableCol extends PureComponent<TableColProps> {
  static displayName = 'TableCol';

  static contextType = TableContext;

  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };

  render() {
    const { width, minWidth } = this.props;
    return (
      <col
        style={{ width: pxToRem(width), minWidth: pxToRem(minWidth) }}
      />
    );
  }
}
