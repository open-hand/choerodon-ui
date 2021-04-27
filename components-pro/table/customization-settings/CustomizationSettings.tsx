import React, { FunctionComponent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { action, set, toJS } from 'mobx';
import noop from 'lodash/noop';
import Collapse from 'choerodon-ui/lib/collapse';
import CollapsePanel from 'choerodon-ui/lib/collapse/CollapsePanel';
import { getColumnKey, getColumnLock } from '../utils';
import ColumnGroups from './column-groups';
import DataSet from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { treeReduce } from '../../_util/treeUtils';
import { ColumnProps } from '../Column';
import TableContext from '../TableContext';
import { $l } from '../../locale-context';
import Button from '../../button/Button';
import { ButtonColor, FuncType } from '../../button/enum';
import { Size } from '../../core/enum';
import { mergeDefaultProps, normalizeColumns } from '../TableStore';
import { ModalProps } from '../../modal/Modal';
import Form from '../../form/Form';
import ObserverNumberField from '../../number-field/NumberField';
import SelectBox from '../../select-box/SelectBox';
import Option from '../../option/Option';
import { TableHeightType } from '../enum';
import { LabelLayout } from '../../form/enum';
import { ShowHelp } from '../../field/enum';

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

function diff(height: number = 0): number {
  if (typeof document !== 'undefined') {
    return document.documentElement.clientHeight - height;
  }
  return 0;
}

const HEIGHT_CHANGE_KEY = '__heightChange__';

export interface CustomizationSettingsProps {
  modal?: { handleOk: Function, handleCancel: Function, update: (props: ModalProps) => void };
}

const CustomizationSettings: FunctionComponent<CustomizationSettingsProps> = observer((props) => {
  const { modal } = props;
  const { update, handleOk, handleCancel } = modal || { update: noop, handleOk: noop };
  const { tableStore } = useContext(TableContext);
  const { originalColumns, prefixCls, customized } = tableStore;
  const [customizedColumns, setCustomizedColumns] = useState<ColumnProps[]>(originalColumns);
  const tableRecord: Record = useMemo(() => new DataSet({
    data: [
      {
        heightType: tableStore.heightType,
        height: tableStore.totalHeight,
        heightDiff: diff(tableStore.totalHeight),
      },
    ],
    events: {
      update({ record, name, value }) {
        record.setState(HEIGHT_CHANGE_KEY, (record.getState(HEIGHT_CHANGE_KEY) || 0) + 1);
        const { tempCustomized } = tableStore;
        if (tempCustomized) {
          set(tempCustomized, name, value);
          if (name === 'height' && record.get('heightType') === TableHeightType.fixed) {
            record.set('heightDiff', diff(value));
            set(tempCustomized, 'heightType', TableHeightType.fixed);
          } else if (name === 'heightDiff' && record.get('heightType') === TableHeightType.flex) {
            record.set('height', diff(value));
            set(tempCustomized, 'heightType', TableHeightType.flex);
          }
        }
        record.setState(HEIGHT_CHANGE_KEY, record.getState(HEIGHT_CHANGE_KEY) - 1);
        if (record.getState(HEIGHT_CHANGE_KEY) === 0) {
          tableStore.node.handleHeightTypeChange();
          record.setState(HEIGHT_CHANGE_KEY, undefined);
        }
      },
    },
  }).current!, [tableStore]);
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
  const handleRestore = useCallback(action(() => {
    const { props: { columns, children }, originalHeightType } = tableStore;
    setCustomizedColumns(columns
      ? mergeDefaultProps(columns)
      : normalizeColumns(children));
    tableStore.tempCustomized = {
      columns: {},
    };
    tableStore.node.handleHeightTypeChange(true);
    tableRecord.init({
      heightType: originalHeightType,
      height: tableStore.totalHeight,
      heightDiff: diff(tableStore.totalHeight),
    });
  }), [tableRecord, tableStore, tableRecord]);
  const handleOption = useCallback(() => ({
    className: `${prefixCls}-customization-option`,
  }), [prefixCls]);
  const handleCollapseChange = useCallback(action((key: string | string[]) => {
    tableStore.customizedActiveKey = ([] as string[]).concat(key);
  }), [tableStore]);
  useEffect(() => {
    if (update) {
      update({
        title: (
          <>
            <span>{$l('Table', 'customization_settings')}</span>
            <Button
              className={`${prefixCls}-customization-header-button`}
              color={ButtonColor.primary}
              funcType={FuncType.flat}
              size={Size.small}
              onClick={handleRestore}
            >
              {$l('Table', 'restore_default')}
            </Button>
          </>
        ),
      });
    }
  }, [update, prefixCls, handleRestore]);
  useEffect(action(() => {
    tableStore.tempCustomized = {
      height: tableStore.totalHeight,
      heightDiff: diff(tableStore.totalHeight),
      ...toJS(customized),
    };
  }), [tableStore]);
  useEffect(() => {
    if (handleOk) {
      handleOk(action(() => {
        const { tempCustomized } = tableStore;
        tableStore.tempCustomized = { columns: {} };
        tableStore.saveCustomized(tempCustomized);
        tableStore.initColumns();
        tableStore.node.handleHeightTypeChange();
      }));
    }
    if (handleCancel) {
      handleCancel(action(() => {
        tableStore.tempCustomized = { columns: {} };
        tableStore.node.handleHeightTypeChange();
      }));
    }
  }, [handleOk, handleCancel, columnDataSet, tableStore]);
  const tableHeightType = tableRecord.get('heightType');
  return (
    <Collapse
      bordered={false}
      activeKey={tableStore.customizedActiveKey.slice()}
      onChange={handleCollapseChange}
      expandIconPosition="right"
    >
      <CollapsePanel
        header={
          <div className={`${prefixCls}-customization-panel-header`}>
            {$l('Table', 'table_settings')}
          </div>
        }
        key="table"
      >
        <Form className={`${prefixCls}-customization-form`} record={tableRecord} labelLayout={LabelLayout.float}>
          <SelectBox vertical name="heightType" label={$l('Table', 'height_settings')} onOption={handleOption}>
            <Option value={TableHeightType.auto}>
              {$l('Table', 'auto_height')}
            </Option>
            <Option value={TableHeightType.fixed}>
              <span className={`${prefixCls}-customization-option-label`}>
                {$l('Table', 'fixed_height')}
              </span>
              <ObserverNumberField
                size={Size.small}
                className={`${prefixCls}-customization-option-input`}
                labelLayout={LabelLayout.none}
                name="height"
                disabled={tableHeightType !== TableHeightType.fixed}
                step={1}
              />
            </Option>
            <Option value={TableHeightType.flex}>
              <span className={`${prefixCls}-customization-option-label`}>
                {$l('Table', 'flex_height')}
              </span>
              <ObserverNumberField
                size={Size.small}
                groupClassName={`${prefixCls}-customization-option-input`}
                labelLayout={LabelLayout.none}
                name="heightDiff"
                disabled={tableHeightType !== TableHeightType.flex}
                showHelp={ShowHelp.tooltip}
                help={$l('Table', 'flex_height_help')}
                step={1}
              />
            </Option>
          </SelectBox>
        </Form>
      </CollapsePanel>
      <CollapsePanel
        header={
          <div className={`${prefixCls}-customization-panel-header`}>
            {$l('Table', 'column_settings')}
          </div>
        }
        key="columns"
      >
        <ColumnGroups dataSet={columnDataSet} />
      </CollapsePanel>
    </Collapse>
  );
});

CustomizationSettings.displayName = 'CustomizationSettings';

export default CustomizationSettings;
