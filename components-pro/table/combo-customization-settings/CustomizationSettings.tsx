import React, { FunctionComponent, Key, useCallback, useContext, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { action, toJS } from 'mobx';
import isUndefined from 'lodash/isUndefined';
import { getColumnKey, getColumnLock } from '../utils';
import ColumnGroups from './column-groups';
import DataSet from '../../data-set/DataSet';
import { treeReduce } from '../../_util/treeUtils';
import { ColumnProps } from '../Column';
import TableContext from '../TableContext';
import { $l } from '../../locale-context';
import Button from '../../button/Button';
import { ButtonColor } from '../../button/enum';

function normalizeColumnsToTreeData(columns: ColumnProps[]): object[] {
  return [...treeReduce<Map<Key, object>, ColumnProps>(columns, (map, column, _sort, parentColumn) => {
    if (!column.__tableGroup || (!column.children && column.__group)) {
      const key = column.__originalKey || getColumnKey(column);
      map.set(key, {
        key,
        parentKey: parentColumn && (parentColumn.__originalKey || getColumnKey(parentColumn)),
        lock: getColumnLock(column.lock),
        width: column.width,
        header: column.header,
        title: column.title,
        hidden: column.hidden,
        name: column.name,
        sort: _sort,
        titleEditable: column.titleEditable,
        hideable: column.hideable,
        draggable: column.draggable,
      });
    }
    return map;
  }, new Map()).values()].filter((item: ColumnProps) => item && !isUndefined(item.name));
}

function diff(height = 0): number {
  if (typeof document !== 'undefined') {
    return document.documentElement.clientHeight - height;
  }
  return 0;
}

export interface CustomizationSettingsProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const CustomizationSettings: FunctionComponent<CustomizationSettingsProps> = function CustomizationSettings(props) {
  const { visible, setVisible } = props;
  const { prefixCls, tableStore } = useContext(TableContext);
  const { leftOriginalColumns, originalColumns, rightOriginalColumns, customized } = tableStore;
  const customizedColumns:ColumnProps[]  = useMemo(() => [...leftOriginalColumns, ...originalColumns, ...rightOriginalColumns], [leftOriginalColumns, originalColumns, rightOriginalColumns, customized]);
  const columnDataSet = useMemo(() => new DataSet({
    data: normalizeColumnsToTreeData(customizedColumns),
    paging: false,
    primaryKey: 'key',
    idField: 'key',
    parentField: 'parentKey',
    fields: [
      { name: 'lock' },
      { name: 'sort' },
    ],
    events: {
      update({ record, name, value }) {
        if (name === 'hidden') {
          const { children: records } = record;
          if (records) {
            records.forEach(child => child.set(name, value));
          }
        }
        const { tempCustomized } = tableStore;
        if (tempCustomized) {
          const { key } = record;
          if (!tempCustomized.columns[key]) {
            tempCustomized.columns[key] = {};
          }
          tempCustomized.columns[key][name] = value;
        }
      },
    },
  }), [customizedColumns, tableStore]);
  useEffect(action(() => {
    tableStore.tempCustomized = {
      height: tableStore.totalHeight,
      heightDiff: diff(tableStore.totalHeight),
      ...toJS(customized),
    };
  }), [tableStore, tableStore.customized]);
  const saveCustomized = useCallback(action(() => {
    const { tempCustomized } = tableStore;
    tableStore.tempCustomized = { columns: {} };
    tableStore.saveCustomized(tempCustomized);
    tableStore.initColumns();
    setVisible(!visible);
  }), [columnDataSet, tableStore, visible])
  const cancelCustomized = useCallback(action(() => {
    tableStore.tempCustomized = { columns: {} };
    tableStore.initColumns();
    setVisible(!visible);
  }), [columnDataSet, tableStore, visible])
  return (
    <>
      <ColumnGroups dataSet={columnDataSet} />
      <div className={`${prefixCls}-combo-customization-footer`}>
        <Button onClick={saveCustomized} color={ButtonColor.primary}>
          {$l('Modal', 'ok')}
        </Button>
        <Button onClick={cancelCustomized}>
          {$l('Modal', 'cancel')}
        </Button>
      </div>
    </>
  );
};

CustomizationSettings.displayName = 'CustomizationSettings';

export default observer(CustomizationSettings);
