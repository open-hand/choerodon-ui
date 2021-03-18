import React, { FunctionComponent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { getColumnKey, getColumnLock } from '../utils';
import ColumnGroups from './column-groups';
import DataSet from '../../data-set/DataSet';
import { treeReduce } from '../../_util/treeUtils';
import { ColumnProps } from '../Column';
import TableContext from '../TableContext';
import { $l } from '../../locale-context';
import Button from '../../button/Button';
import { ButtonColor, FuncType } from '../../button/enum';
import { Size } from '../../core/enum';
import { Customized } from '../Table';
import { mergeDefaultProps, normalizeColumns } from '../TableStore';

function normalizeColumnsToTreeData(columns: ColumnProps[]) {
  return treeReduce<object[], ColumnProps>(columns, (list, column, _sort, parentColumn) => list.concat({
    key: getColumnKey(column),
    parentKey: parentColumn && getColumnKey(parentColumn),
    lock: getColumnLock(column.lock),
    width: column.width,
    header: column.header,
    title: column.title,
    hidden: column.hidden,
    name: column.name,
    sort: column.sort,
    titleEditable: column.titleEditable,
    hideable: column.hideable,
  }), []);
}

export interface CustomizationSettingsProps {
  modal?: { handleOk: Function };
}

const CustomizationSettings: FunctionComponent<CustomizationSettingsProps> = observer((props) => {
  const { modal } = props;
  const { tableStore } = useContext(TableContext);
  const { props: { columns, children }, originalColumns, prefixCls, customized } = tableStore;
  const [customizedColumns, setCustomizedColumns] = useState<ColumnProps[]>(originalColumns);
  const customizedRef = useRef<Customized | null>(null);
  const columnDataSet = useMemo(() => new DataSet({
    data: normalizeColumnsToTreeData(customizedColumns),
    paging: false,
    primaryKey: 'key',
    idField: 'key',
    parentField: 'parentKey',
    fields: [
      { name: 'lock', group: true },
    ],
    events: {
      update({ record, name, value }) {
        if (name === 'hidden') {
          const { children: records } = record;
          if (records) {
            records.forEach(child => child.set(name, value));
          }
        }
        const { current } = customizedRef;
        if (current) {
          const { key } = record;
          if (!current.columns[key]) {
            current.columns[key] = {};
          }
          current.columns[key][name] = value;
        }
      },
    },
  }), [customizedColumns, customizedRef]);
  const handleRestore = useCallback(() => {
    const { current } = customizedRef;
    if (current) {
      current.columns = {};
    }
    setCustomizedColumns(columns
      ? mergeDefaultProps(columns)
      : normalizeColumns(children));
  }, [customizedRef, columns, children]);
  useEffect(() => {
    customizedRef.current = toJS(customized);
  }, [customizedRef]);
  useEffect(() => {
    if (modal) {
      modal.handleOk(() => {
        const { current } = customizedRef;
        tableStore.saveCustomized(current);
        tableStore.initColumns();
      });
    }
  }, [modal, columnDataSet, customizedRef, tableStore]);
  return (
    <div>
      <div className={`${prefixCls}-customization-panel-header`}>
        <div className={`${prefixCls}-customization-panel-title`}>
          {$l('Table', 'column_settings')}
        </div>
        <Button color={ButtonColor.primary} funcType={FuncType.flat} size={Size.small} onClick={handleRestore}>
          {$l('Table', 'restore_default')}
        </Button>
      </div>
      <ColumnGroups dataSet={columnDataSet} />
    </div>
  );
});

CustomizationSettings.displayName = 'CustomizationSettings';

export default CustomizationSettings;
