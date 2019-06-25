import React, { Component, CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import { ColumnProps } from './Column';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import DataSet from '../data-set/DataSet';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import classNames from 'classnames';
import { getAlignByField } from './utils';
import { ColumnAlign } from './enum';

export interface TableFooterCellProps extends ElementProps {
  dataSet: DataSet;
  column: ColumnProps;
}

@observer
export default class TableFooterCell extends Component<TableFooterCellProps, any> {
  static displayName = 'TableFooterCell';

  static propTypes = {
    column: PropTypes.object.isRequired,
  };

  static contextType = TableContext;

  getFooter(footer, dataSet): ReactNode {
    switch (typeof footer) {
      case 'function':
        return footer(dataSet, this.props.column.name);
      case 'string':
        return <span>{footer}</span>;
      default:
        return footer;
    }
  }

  render() {
    const { column, prefixCls, dataSet } = this.props;
    const { rowHeight } = this.context.tableStore;
    const { footer, footerClassName, footerStyle = {}, align, name, command } = column;
    const classString = classNames(`${prefixCls}-cell`, footerClassName);
    const innerProps: any = {
      className: `${prefixCls}-cell-inner`,
    };
    if (rowHeight !== 'auto') {
      innerProps.style = {
        height: pxToRem(rowHeight),
      };
    }
    const cellStyle: CSSProperties = {
      textAlign: align || (command ? ColumnAlign.center : getAlignByField(dataSet.getField(name))),
      ...footerStyle,
    };
    return (
      <th
        className={classString}
        style={omit(cellStyle, ['width', 'height'])}
      >
        <div {...innerProps}>
          {this.getFooter(footer, dataSet)}
        </div>
      </th>
    );
  }
}
