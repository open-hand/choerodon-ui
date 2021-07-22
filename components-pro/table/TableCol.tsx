import React, { FunctionComponent, useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { get } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { ColumnProps, minColumnWidth } from './Column';
import useComputed from '../use-computed';

export interface TableColProps extends ElementProps {
  column: ColumnProps;
  last: boolean;
}

const TableCol: FunctionComponent<TableColProps> = observer((props) => {
  const { column, last } = props;
  const { tableStore } = useContext(TableContext);
  const style = useComputed(() => ({
    width: pxToRem(last && !tableStore.hasEmptyWidthColumn ? undefined : get(column, 'width')),
    minWidth: pxToRem(minColumnWidth(column)),
  }), [last, column, tableStore]);
  return (
    <col
      className={`${tableStore.prefixCls}-col`}
      style={style}
    />
  );
});

TableCol.displayName = 'TableCol';

TableCol.propTypes = {
  column: PropTypes.object.isRequired,
  last: PropTypes.bool.isRequired,
};

export default TableCol;
