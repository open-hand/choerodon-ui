import React, { FunctionComponent, useCallback } from "react";
import { observer } from "mobx-react";
import Typography from "../../../typography";
import Button from "../../../button";
import { ButtonColor, FuncType } from "../../../button/enum";
import { $l } from "../../../locale-context";
import { TableContextValue } from '../../TableContext';
import { Size } from '../../../core/enum';
import DataSet from '../../../data-set/DataSet';

interface ColumnsVisibilityControlProps {
  context: TableContextValue;
  columnDataSet: DataSet;
  columnHideable: boolean
}

const ColumnsVisibilityControl: FunctionComponent<ColumnsVisibilityControlProps> = (props) => {
  const { columnDataSet, columnHideable, context: { prefixCls } } = props;

  const handleColumnsVisibilityChange = useCallback((hidden: boolean) => {
    columnDataSet.forEach(record => {
      if (record.get('hideable') !== false && !(record.parent && record.parent.get('hidden'))) {
        record.set('hidden', hidden);
      }
    });
  }, [columnDataSet]);

  return (
    <div
      onClick={e => e.stopPropagation()}
      className={`${prefixCls}-customization-columns-visibility-control`}
      hidden={columnHideable === false}
    >
      <Typography.Text value={$l('Table', 'columns_visibility_control')} />
      <Button
        className={`${prefixCls}-customization-header-button`}
        color={ButtonColor.primary}
        funcType={FuncType.flat}
        size={Size.small}
        key="showAll"
        onClick={() => handleColumnsVisibilityChange(false)}
      >
        {$l('Table', 'show_all_columns')}
      </Button>
      <Button
        className={`${prefixCls}-customization-header-button`}
        color={ButtonColor.primary}
        funcType={FuncType.flat}
        size={Size.small}
        key="hideAll"
        onClick={() => handleColumnsVisibilityChange(true)}
      >
        {$l('Table', 'hide_all_columns')}
      </Button>
    </div>
  );
};

ColumnsVisibilityControl.displayName = 'ColumnsVisibilityControl';

export default observer(ColumnsVisibilityControl);
