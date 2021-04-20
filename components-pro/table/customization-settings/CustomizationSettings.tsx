import React, { FunctionComponent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { action, toJS } from 'mobx';
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
import { Customized } from '../Table';
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

export interface CustomizationSettingsProps {
  modal?: { handleOk: Function, update: (props: ModalProps) => void };
}

const CustomizationSettings: FunctionComponent<CustomizationSettingsProps> = observer((props) => {
  const { modal } = props;
  const { update, handleOk } = modal || { update: noop, handleOk: noop };
  const { tableStore } = useContext(TableContext);
  const { originalColumns, prefixCls, customized, totalHeight } = tableStore;
  const [heightType, setHeightType] = useState(tableStore.heightType);
  const [customizedColumns, setCustomizedColumns] = useState<ColumnProps[]>(originalColumns);
  const customizedRef = useRef<Customized | null>(null);
  const tableRecord: Record = useMemo(() => new DataSet({
    data: [
      { heightType, height: totalHeight, heightDiff: totalHeight ? document.documentElement.clientHeight - totalHeight : undefined },
    ],
    events: {
      update({ record, name, value }) {
        const { current } = customizedRef;
        if (current) {
          current[name] = value;
          if (name === 'heightType') {
            if (value === TableHeightType.fixed) {
              current.height = record.get('height');
            } else if (value === TableHeightType.flex) {
              current.heightDiff = record.get('heightDiff');
            }
          } else if (name === 'height') {
            current.heightType = TableHeightType.fixed;
          } else if (name === 'heightDiff') {
            current.heightType = TableHeightType.flex;
          }
        }
      },
    },
  }).current!, [heightType, totalHeight, customizedRef]);
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
  const handleRestore = useCallback(action(() => {
    const { props: { columns, children }, originalHeightType } = tableStore;
    setCustomizedColumns(columns
      ? mergeDefaultProps(columns)
      : normalizeColumns(children));
    setHeightType(originalHeightType);
    customizedRef.current = {
      columns: {},
    };
  }), [customizedRef, tableStore]);
  const handleOption = useCallback(() => ({
    className: `${prefixCls}-customization-option`,
  }), [prefixCls]);
  const handleCollapseChange = useCallback(action((key: string | string[]) => {
    const keys: string[] = [];
    tableStore.customizedActiveKey = keys.concat(key);
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
  useEffect(() => {
    customizedRef.current = toJS(customized);
  }, [customizedRef]);
  useEffect(() => {
    if (handleOk) {
      handleOk(action(() => {
        const { current } = customizedRef;
        tableStore.saveCustomized(current);
        tableStore.initColumns();
        tableStore.node.handleHeightTypeChange();
      }));
    }
  }, [handleOk, columnDataSet, customizedRef, tableStore]);
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
