import React, { FunctionComponent, ReactElement, useCallback, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { action } from 'mobx';
import { Size } from '../core/enum';
import DataSet from '../data-set/DataSet';
import { RecordCachedType } from '../data-set/enum';
import { $l } from '../locale-context';
import TableContext from './TableContext';
import Tooltip from '../tooltip';
import Button from '../button/Button';
import ObserverSelect from '../select/Select';
import { FuncType } from '../button/enum';
import { Locale } from '../locale-context/locale';
import TableStore from './TableStore';
import { getCount } from './utils';

const { Option } = ObserverSelect;

export const cachedTypeIntlMap: Record<RecordCachedType, keyof Locale['Table']> = {
  [RecordCachedType.selected]: 'cached_type_selected',
  [RecordCachedType.add]: 'cached_type_created',
  [RecordCachedType.update]: 'cached_type_updated',
  [RecordCachedType.delete]: 'cached_type_destroyed',
};

interface CachedTipProps {
  dataSet: DataSet;
  tableStore: TableStore;
  prefixCls?: string;
}

const CachedTips: FunctionComponent<CachedTipProps> = function CachedTip(props) {
  const {
    dataSet,
    tableStore,
    prefixCls,
  } = props;
  let { recordCachedType, defaultRecordCachedType } = tableStore;
  const options: ReactElement[] = [];
  const {
    selected: { length: selectedLength },
    cachedCreated: { length: createdLength },
    cachedUpdated: { length: updatedLength },
    cachedDestroyed: { length: destroyedLength },
  } = dataSet;
  const lengths: Map<RecordCachedType, number> = new Map<RecordCachedType, number>(
    [
      [RecordCachedType.selected, selectedLength],
      [RecordCachedType.add, createdLength],
      [RecordCachedType.update, updatedLength],
      [RecordCachedType.delete, destroyedLength],
    ],
  );
  lengths.forEach((length, key) => {
    if (length) {
      options.push(
        <Option key={String(key)} value={key}>
          {$l('Table', cachedTypeIntlMap[key])}
        </Option>,
      );
      if (!defaultRecordCachedType || key === RecordCachedType.add) {
        defaultRecordCachedType = key;
      }
    } else {
      if (recordCachedType === key) {
        recordCachedType = undefined;
      }
      if (defaultRecordCachedType === key) {
        defaultRecordCachedType = undefined;
      }
    }
  });
  const optionsRenderer = useCallback(({ text, value }) => {
    return (
      <>
        {text}
        <span className={`${prefixCls}-cached-type-count`}>
          {getCount(dataSet, value)}
        </span>
      </>
    );
  }, [prefixCls, dataSet]);
  const handleChangeRecordCachedType = useCallback(action((newRecordCachedType: RecordCachedType) => {
    tableStore.recordCachedType = newRecordCachedType;
  }), [tableStore]);

  useEffect(action(() => {
    if (tableStore.recordCachedType !== recordCachedType) {
      tableStore.recordCachedType = recordCachedType;
    }
  }), [tableStore, recordCachedType]);

  useEffect(action(() => {
    if (tableStore.defaultRecordCachedType !== defaultRecordCachedType) {
      tableStore.defaultRecordCachedType = defaultRecordCachedType;
      if (defaultRecordCachedType === RecordCachedType.add) {
        tableStore.showCachedSelection = true;
      } else if (!defaultRecordCachedType) {
        tableStore.showCachedSelection = false;
      }
    }
  }), [tableStore, defaultRecordCachedType]);

  if (options.length) {
    return (
      <span>
        {
          $l('Table', 'cached_tips', {
            type: options.length > 1 ? (
              <ObserverSelect
                className={`${prefixCls}-cached-type`}
                optionRenderer={optionsRenderer}
                isFlat
                value={recordCachedType || defaultRecordCachedType}
                onChange={handleChangeRecordCachedType}
                size={Size.small}
                clearButton={false}
              >
                {options}
              </ObserverSelect>
            ) : $l('Table', cachedTypeIntlMap[recordCachedType || defaultRecordCachedType || RecordCachedType.selected]),
            count: getCount(dataSet, recordCachedType || defaultRecordCachedType),
          })
        }
      </span>
    );
  }
  return null;
};
const ObserverCachedTips = observer(CachedTips);

const SelectionTips: FunctionComponent<any> = function SelectionTips() {
  const { prefixCls, dataSet, tableStore, showSelectionCachedButton, onShowCachedSelectionChange } = useContext(TableContext);
  const { showCachedSelection } = tableStore;
  const getTitle = () => {
    return $l('Table', showCachedSelection ? 'hide_cached_records' : 'show_cached_records');
  };
  const cachedButton = showSelectionCachedButton && (dataSet.cacheSelectionKeys || dataSet.cacheModifiedKeys) && dataSet.cachedRecords.length > 0 ? (
    <Tooltip title={getTitle}>
      <Button
        size={Size.small}
        className={`${prefixCls}-switch`}
        funcType={FuncType.flat}
        icon={showCachedSelection ? 'visibility_off' : 'visibility'}
        onClick={action(() => {
          const newShowCachedSelection = !showCachedSelection;
          tableStore.showCachedSelection = newShowCachedSelection;
          if (onShowCachedSelectionChange) {
            onShowCachedSelectionChange(newShowCachedSelection);
          }
        })}
      />
    </Tooltip>
  ) : null;
  if (tableStore.showCachedTips) {
    return (
      <div className={`${prefixCls}-selection-tips`}>
        <ObserverCachedTips
          dataSet={dataSet}
          tableStore={tableStore}
          prefixCls={prefixCls}
        />
        {cachedButton}
      </div>
    );
  }
  return tableStore.showSelectionTips ? (
    <div className={`${prefixCls}-selection-tips`}>
      <span>{$l('Table', 'selection_tips', { count: getCount(dataSet, RecordCachedType.selected) })}</span>
      {cachedButton}
    </div>
  ) : cachedButton;
};

SelectionTips.displayName = 'SelectionTips';

export default observer(SelectionTips);
