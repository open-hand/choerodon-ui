import React, { FunctionComponent, Key, MouseEvent, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { action, set, toJS } from 'mobx';
import noop from 'lodash/noop';
import defaultTo from 'lodash/defaultTo';
import Collapse from 'choerodon-ui/lib/collapse';
import CollapsePanel from 'choerodon-ui/lib/collapse/CollapsePanel';
import { toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
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
import { normalizeGroupColumns } from '../TableStore';
import Form from '../../form/Form';
import ObserverNumberField from '../../number-field/NumberField';
import SelectBox from '../../select-box/SelectBox';
import Option from '../../option/Option';
import { TableHeightType } from '../enum';
import { LabelLayout } from '../../form/enum';
import { ShowHelp } from '../../field/enum';
import { ViewMode } from '../../radio/enum';
import Icon from '../../icon';
import Tooltip from '../../tooltip/Tooltip';
import { modalChildrenProps } from '../../modal/interface';

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
        sort: column.sort,
        titleEditable: column.titleEditable,
        hideable: column.hideable,
        draggable: column.draggable,
      });
    }
    return map;
  }, new Map()).values()];
}

function diff(height = 0): number {
  if (typeof document !== 'undefined') {
    return document.documentElement.clientHeight - height;
  }
  return 0;
}

const HEIGHT_CHANGE_KEY = '__heightChange__';

export interface CustomizationSettingsProps {
  modal?: modalChildrenProps;
}

const CustomizationSettings: FunctionComponent<CustomizationSettingsProps> = function CustomizationSettings(props) {
  const { modal } = props;
  const { handleOk, handleCancel } = modal || { update: noop, handleOk: noop };
  const { prefixCls, tableStore } = useContext(TableContext);
  const { leftOriginalColumns, originalColumns, rightOriginalColumns, customized } = tableStore;
  const [customizedColumns, setCustomizedColumns] = useState<ColumnProps[]>(() => [...leftOriginalColumns, ...originalColumns, ...rightOriginalColumns]);
  const tableRecord: Record = useMemo(() => new DataSet({
    data: [
      {
        heightType: tableStore.heightType,
        height: tableStore.totalHeight,
        heightDiff: diff(tableStore.totalHeight),
        aggregation: tableStore.aggregation,
        size: tableStore.size,
        parityRow: tableStore.parityRow,
        aggregationExpandType: tableStore.aggregationExpandType,
      },
    ],
    events: {
      update({ record, name, value }) {
        record.setState(HEIGHT_CHANGE_KEY, (record.getState(HEIGHT_CHANGE_KEY) || 0) + 1);
        const { tempCustomized, props: { columns, children } } = tableStore;
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
          } else if (name === 'aggregation') {
            const [left, center, right] = normalizeGroupColumns(tableStore, columns, children, value, tempCustomized.columns);
            setCustomizedColumns([...left, ...center, ...right]);
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
  const handleRestoreTable = useCallback(action((e: MouseEvent<any>) => {
    e.stopPropagation();
    const { originalHeightType, props: { style } } = tableStore;
    const defaultHeight = defaultTo(toPx(style && style.height), tableStore.totalHeight);
    tableStore.node.handleHeightTypeChange(true);
    tableRecord.init({
      heightType: originalHeightType,
      height: defaultHeight,
      heightDiff: diff(defaultHeight),
    });
  }), [tableRecord, tableStore]);
  const handleRestoreColumns = useCallback(action((e: MouseEvent<any>) => {
    e.stopPropagation();
    const { props: { columns, children } } = tableStore;
    const aggregation = tableRecord.get('aggregation');
    const [left, center, right] = normalizeGroupColumns(tableStore, columns, children, aggregation);
    setCustomizedColumns([...left, ...center, ...right]);
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
        const { tempCustomized, aggregation, props: { onAggregationChange } } = tableStore;
        tableStore.tempCustomized = { columns: {} };
        tableStore.saveCustomized(tempCustomized);
        tableStore.initColumns();
        tableStore.node.handleHeightTypeChange();
        tableStore.actualRowHeight = undefined;
        const { aggregation: customAggregation } = tempCustomized;
        if (onAggregationChange && customAggregation !== undefined && customAggregation !== aggregation) {
          onAggregationChange(customAggregation);
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
  const tableSettings: ReactElement[] = [];
  if (tableStore.heightChangeable) {
    const tableHeightType = tableRecord.get('heightType');
    tableSettings.push(
      <SelectBox key="heightType" vertical name="heightType" label={$l('Table', 'height_settings')} onOption={handleOption}>
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
      </SelectBox>,
    );
  }
  if (tableRecord.get('aggregation')) {
    tableSettings.push(
      <SelectBox key="aggregationExpandType" name="aggregationExpandType" label={$l('Table', 'row_expand_settings')}>
        <Option value="cell">
          {$l('Table', 'expand_cell')}
        </Option>
        <Option value="row">
          {$l('Table', 'expand_row')}
        </Option>
        <Option value="column">
          {$l('Table', 'expand_column')}
        </Option>
      </SelectBox>,
    );
  }
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
            {$l('Table', 'display_settings')}
          </span>
        }
        key="display"
      >
        <Form className={`${prefixCls}-customization-form`} record={tableRecord} labelLayout={LabelLayout.float}>
          {
            tableStore.hasAggregationColumn && (tableStore.props.onAggregationChange || tableStore.props.aggregation === undefined) && (
              <SelectBox name="aggregation" label={$l('Table', 'view_display')} mode={ViewMode.button}>
                <Option value={false} className={`${prefixCls}-customization-select-view-option`}>
                  <Tooltip title={$l('Table', 'tiled_view')} placement="top">
                    <div className={`${prefixCls}-customization-select-view-option-inner ${prefixCls}-customization-not-aggregation`} />
                  </Tooltip>
                </Option>
                <Option value className={`${prefixCls}-customization-select-view-option`}>
                  <Tooltip title={$l('Table', 'aggregation_view')} placement="top">
                    <div className={`${prefixCls}-customization-select-view-option-inner ${prefixCls}-customization-aggregation`} />
                  </Tooltip>
                </Option>
              </SelectBox>
            )
          }
          <SelectBox name="size" label={$l('Table', 'density_display')} mode={ViewMode.button}>
            <Option value={Size.default} className={`${prefixCls}-customization-select-view-option`}>
              <Tooltip title={$l('Table', 'normal')} placement="top">
                <div className={`${prefixCls}-customization-select-view-option-inner ${prefixCls}-customization-size-default`} />
              </Tooltip>
            </Option>
            <Option value={Size.small} className={`${prefixCls}-customization-select-view-option`}>
              <Tooltip title={$l('Table', 'compact')} placement="top">
                <div className={`${prefixCls}-customization-select-view-option-inner ${prefixCls}-customization-size-small`} />
              </Tooltip>
            </Option>
          </SelectBox>
          <SelectBox name="parityRow" label={$l('Table', 'parity_row')} mode={ViewMode.button}>
            <Option value={false} className={`${prefixCls}-customization-select-view-option`}>
              <Tooltip title={$l('Table', 'normal')} placement="top">
                <div className={`${prefixCls}-customization-select-view-option-inner ${prefixCls}-customization-no-parity-row`} />
              </Tooltip>
            </Option>
            <Option value className={`${prefixCls}-customization-select-view-option`}>
              <Tooltip title={$l('Table', 'parity_row')} placement="top">
                <div className={`${prefixCls}-customization-select-view-option-inner ${prefixCls}-customization-parity-row`} />
              </Tooltip>
            </Option>
          </SelectBox>
        </Form>
      </CollapsePanel>
      {
        tableSettings.length ? (
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
              {tableSettings}
            </Form>
          </CollapsePanel>
        ) : null
      }
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
