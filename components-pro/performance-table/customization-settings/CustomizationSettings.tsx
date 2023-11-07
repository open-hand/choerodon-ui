import React, { FunctionComponent, MouseEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { action, set, toJS } from 'mobx';
import noop from 'lodash/noop';
import Collapse from 'choerodon-ui/lib/collapse';
import CollapsePanel from 'choerodon-ui/lib/collapse/CollapsePanel';
import ColumnGroups from './column-groups';
import { getColumnFixed, getColumnKey } from '../utils';
import DataSet from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { ColumnProps } from '../Column';
import TableContext from '../TableContext';
import { $l } from '../../locale-context';
import Button from '../../button/Button';
import { ButtonColor, FuncType } from '../../button/enum';
import { Size } from '../../core/enum';
import Form from '../../form/Form';
import ObserverNumberField from '../../number-field/NumberField';
import ObserverSelectBox from '../../select-box/SelectBox';
import Option from '../../option/Option';
import { TableHeightType } from '../../table/enum';
import { LabelLayout } from '../../form/enum';
import { ShowHelp } from '../../field/enum';
import Icon from '../../icon';
import { treeReduce } from '../../_util/treeUtils';
import { ModalChildrenProps } from '../../modal/interface';

function normalizeColumnsToTreeData(columns: ColumnProps[]) {
  return treeReduce<object[], ColumnProps>(columns, (list, column, _sort, parentColumn) => list.concat({
    key: getColumnKey(column),
    parentKey: parentColumn && getColumnKey(parentColumn),
    fixed: getColumnFixed(column.fixed),
    width: column.width,
    title: column.title,
    header: column.header,
    hidden: column.hidden,
    sort: column.sort,
    titleEditable: column.titleEditable,
    hideable: column.hideable,
  }), []);
}

function diff(height = 0): number {
  if (typeof document !== 'undefined') {
    return document.documentElement.clientHeight - height;
  }
  return 0;
}

const HEIGHT_CHANGE_KEY = '__heightChange__';

export interface CustomizationSettingsProps {
  modal?: ModalChildrenProps;
}

const CustomizationSettings: FunctionComponent<CustomizationSettingsProps> = function CustomizationSettings(props) {
  const { modal } = props;
  const { handleOk, handleCancel } = modal || { update: noop, handleOk: noop };
  const { tableStore } = useContext(TableContext);
  const { originalColumns, customized, proPrefixCls: prefixCls } = tableStore;

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
          if (name === 'heightType') {
            if (value === TableHeightType.fixed) {
              set(tempCustomized, 'height', record.get('height'));
            } else if (value === TableHeightType.flex) {
              set(tempCustomized, 'heightDiff', record.get('heightDiff'));
            }
          } else if (name === 'height' && record.get('heightType') === TableHeightType.fixed) {
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
      { name: 'fixed', group: true },
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

  const handleRestoreTable = useCallback(action((e: MouseEvent<any>) => {
    e.stopPropagation();
    const { originalHeightType } = tableStore;
    tableStore.node.handleHeightTypeChange();
    tableRecord.init({
      heightType: originalHeightType,
      height: tableStore.totalHeight,
      heightDiff: diff(tableStore.totalHeight),
    });
  }), [tableRecord, tableStore]);

  const handleRestoreColumns = useCallback(action((e: MouseEvent<any>) => {
    e.stopPropagation();
    const { columns = [] } = tableStore.node.props;
    setCustomizedColumns(columns.map((column) => {
      const fixed = getColumnFixed(column.fixed);
      const hidden = column.hidden || false;
      return { ...column, fixed, hidden };
    }));
    tableStore.tempCustomized.columns = {};
  }), [tableRecord, tableStore]);

  const handleOption = useCallback(() => ({
    className: `${prefixCls}-customization-option`,
  }), [prefixCls]);
  const handleCollapseChange = useCallback(action((key: string | string[]) => {
    tableStore.customizedActiveKey = ([] as string[]).concat(key);
  }), [tableStore]);

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
        if (tableStore.node.props.virtualized) { 
          tableStore.node.scrollLeft();
          tableStore.node.scrollX = 0;
        }
      }));
    }
    if (handleCancel) {
      handleCancel(action(() => {
        tableStore.tempCustomized = { columns: {} };
        tableStore.node.handleHeightTypeChange();
      }));
    }
  }, [handleOk, handleCancel, columnDataSet, tableStore]);

  const renderIcon = useCallback(({ isActive }) => <Icon type={isActive ? 'expand_more' : 'navigate_next'} />, []);

  const tableHeightType = tableRecord.get('heightType');

  return (
    <Collapse
      activeKey={tableStore.customizedActiveKey.slice()}
      onChange={handleCollapseChange}
      expandIcon={renderIcon}
      expandIconPosition="text-right"
      className={`${prefixCls}-customization`}
      ghost
    >
      <CollapsePanel
        header={
          <span className={`${prefixCls}-customization-panel-title`}>
            {$l('Table', 'table_settings')}
          </span>
        }
        key="table"
        extra={
          <Button
            className={`${prefixCls}-customization-header-button`}
            color={ButtonColor.primary}
            funcType={FuncType.flat}
            size={Size.small}
            onClick={handleRestoreTable}
          >
            {$l('Table', 'restore_default')}
          </Button>
        }
      >
        <Form className={`${prefixCls}-customization-form`} record={tableRecord} labelLayout={LabelLayout.float}>
          <ObserverSelectBox vertical name="heightType" label={$l('Table', 'height_settings')} onOption={handleOption}>
            <Option value={TableHeightType.auto}>
              {$l('Table', 'auto_height')}
            </Option>
            <Option value={TableHeightType.fixed}>
              <span className={`${prefixCls}-customization-option-label`}>
                {$l('Table', 'fixed_height')}
              </span>
              <ObserverNumberField
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
                groupClassName={`${prefixCls}-customization-option-input`}
                labelLayout={LabelLayout.none}
                name="heightDiff"
                disabled={tableHeightType !== TableHeightType.flex}
                showHelp={ShowHelp.tooltip}
                help={$l('Table', 'flex_height_help')}
                step={1}
              />
            </Option>
          </ObserverSelectBox>
        </Form>
      </CollapsePanel>
      <CollapsePanel
        header={
          <span className={`${prefixCls}-customization-panel-title`}>
            {$l('Table', 'column_settings')}
          </span>
        }
        key="columns"
        extra={
          <Button
            className={`${prefixCls}-customization-header-button`}
            color={ButtonColor.primary}
            funcType={FuncType.flat}
            size={Size.small}
            onClick={handleRestoreColumns}
          >
            {$l('Table', 'restore_default')}
          </Button>
        }
      >
        <ColumnGroups dataSet={columnDataSet} />
      </CollapsePanel>
    </Collapse>
  );
};

CustomizationSettings.displayName = 'CustomizationSettings';

export default observer(CustomizationSettings);
