import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classes from 'component-classes';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';

export interface TableColProps extends ElementProps {
  width?: number | string;
  minWidth?: number | string;
  onResizeEnd: () => void;
}

export default class TableCol extends PureComponent<TableColProps> {
  static displayName = 'TableCol';

  static contextType = TableContext;

  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onResizeEnd: PropTypes.func.isRequired,
  };

  render() {
    const { width, minWidth } = this.props;
    return (
      <col
        style={{ width: pxToRem(width), minWidth: pxToRem(minWidth) }}
        onTransitionEnd={this.handleTransitionEnd}
      />
    );
  }

  componentDidMount() {
    const { prefixCls } = this.props;
    const { element } = this.context.tableStore.node;
    if (element && classes(element).has(`${prefixCls}-resizing`)) {
      this.fireResizeEnd();
    }
  }

  componentDidUpdate(prevProps) {
    const { width } = prevProps;
    if (!width || isNaN(width)) {
      this.fireResizeEnd();
    }
  }

  handleTransitionEnd = () => {
    this.fireResizeEnd();
  };

  fireResizeEnd() {
    const { prefixCls, onResizeEnd } = this.props;
    onResizeEnd();
    classes(this.context.tableStore.node.element).remove(`${prefixCls}-resizing`);
  }
}
