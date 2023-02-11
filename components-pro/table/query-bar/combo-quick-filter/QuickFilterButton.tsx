import React, {useContext, useEffect, useState} from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import isObject from 'lodash/isObject';
import isEnumEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { $l } from '../../../locale-context';
import Button from '../../../button';
import { ButtonColor } from '../../../button/enum';
import Record from '../../../data-set/Record';
import { RecordStatus} from '../../../data-set/enum';
import { SELECTFIELDS } from '../TableComboBar';
import { isEqualDynamicProps, parseValue, stringifyValue, isSelect } from '../TableDynamicFilterBar';
import Store from './QuickFilterMenuContext';
import { TableCustomized } from '../../Table';


/**
 * 根据数据查找需要处理的字段对象
 * @param queryDataSet
 * @param data
 */
function findFieldObj(queryDataSet, data) {
  let name = data[0];
  let value = data[1];
  if (!queryDataSet.fields.has(data[0]) &&
    isObject(data[1]) &&
    !isEnumEmpty(data[1]) &&
    !isArray(data[1])) {
    name = `${data[0]}.${Object.keys(data[1])[0]}`;
    value = Object.values(data[1])[0];
  }
  const field = queryDataSet.getField(name);
  if (field && field.get('lovCode')) {
    const textField = field.get('textField');
    const valueField = field.get('valueField');
    if (typeof value !== 'object') {
      return {
        name,
        value,
        originalValue: field.getValue().slice(),
      };
    }
    return {
      name,
      value: {
        [valueField]: value[valueField],
        [textField]: value[textField],
      },
    };
  }
  if (field && field.get('ignore') !== 'always') {
    return { name, value };
  }
}

/**
 * 快速筛选下拉
 */
const QuickFilterButton = function QuickFilterButton() {
  const [customizedChange, setCustomizedChange] = useState<boolean>(false);
  const { getConfig } = useContext(ConfigContext);
  const {
    tempQueryFields,
    autoQuery,
    dataSet,
    menuDataSet,
    prefixCls,
    queryDataSet,
    filterMenuDataSet,
    conditionDataSet,
    onChange = noop,
    conditionStatus,
    onStatusChange = noop,
    selectFields,
    onOriginalChange = noop,
    filterSave = true,
    filterSaveCallback = noop,
    onReset = noop,
    tableStore,
    refEditors,
  } = useContext(Store);

  const isChooseMenu = filterMenuDataSet && filterMenuDataSet.current && filterMenuDataSet.current.get('filterName');
  const personalColumn = menuDataSet && menuDataSet.current && menuDataSet.current.get('personalColumn') && parseValue(menuDataSet.current.get('personalColumn')) || {};
  const customized = tableStore && tableStore.customized;

  useEffect(() => {
    if (customized || personalColumn) {
      const columns = customized && customized.columns;
      setCustomizedChange(isEqual(parseValue(columns), personalColumn))
    }
  }, [customized, personalColumn])

  /**
   * queryDS 筛选赋值并更新初始勾选项
   * @param init
   */
  const conditionAssign = async (init?: boolean) => {
    onOriginalChange();
    const { current } = menuDataSet;
    let shouldQuery = false;
    if (current) {
      const conditionList = current.get('personalFilter') && parseValue(current.get('personalFilter'));
      const initData = {};
      if (tempQueryFields) {
        runInAction(() => {
          queryDataSet.fields = tempQueryFields;
        });
      }
      const { current: currentQueryRecord } = queryDataSet;
      if (conditionList && conditionList.length) {
        map(conditionList, condition => {
          const { fieldName, value } = condition;
          initData[fieldName] = parseValue(value);
          onChange(fieldName);
        });
        onOriginalChange(Object.keys(initData));
        const emptyRecord = new Record({ ...initData }, queryDataSet);
        dataSet.setState(SELECTFIELDS, Object.keys(initData));
        shouldQuery = !isEqualDynamicProps(initData, currentQueryRecord ? omit(currentQueryRecord.toData(true), ['__dirty']) : {}, queryDataSet, currentQueryRecord);
        runInAction(() => {
          queryDataSet.records.push(emptyRecord);
          queryDataSet.current = emptyRecord;
        });
        onStatusChange(RecordStatus.sync, emptyRecord.toData());
      } else {
        shouldQuery = !isEqualDynamicProps(initData, currentQueryRecord ? omit(currentQueryRecord.toData(true), ['__dirty']) : {}, queryDataSet, currentQueryRecord);
        const emptyRecord = new Record({}, queryDataSet);
        dataSet.setState(SELECTFIELDS, []);
        runInAction(() => {
          queryDataSet.records.push(emptyRecord);
          queryDataSet.current = emptyRecord;
        });
        onStatusChange(RecordStatus.sync);
      }
      const customizedColumn = current.get('personalColumn') && parseValue(current.get('personalColumn'));
      if (tableStore) {
        runInAction(() => {
          const newCustomized: TableCustomized = { columns: { ...customizedColumn } };
          tableStore.tempCustomized = { columns: {} };
          tableStore.saveCustomized(newCustomized);
          tableStore.initColumns();
        })
      }
      if (!init && shouldQuery && autoQuery) {
        if (await dataSet.modifiedCheck(undefined, dataSet, 'query') && queryDataSet && queryDataSet.current && await queryDataSet.current.validate()) {
          dataSet.query();
        } else if (refEditors) {
          let hasFocus = false;
          for (const [key, value] of refEditors.entries()) {
            if (value && !value.valid && !hasFocus) {
              refEditors.get(key).focus();
              hasFocus = true;
            }
          }
        }
      }
    }
  };

  const handleQueryReset = async () => {
    if (filterMenuDataSet && filterMenuDataSet.current && filterMenuDataSet.current.get('filterName')) {
      // 筛选项重置重新赋值
      conditionAssign();
    } else {
      /**
       * 未选择或清除筛选项
       * 重置初始勾选项及初始赋值
       */
      queryDataSet.locate(0);
      const first = queryDataSet.get(0);
      if (first) {
        first.reset();
      }
      onOriginalChange();
      if (autoQuery) {
        if (await dataSet.modifiedCheck(undefined, dataSet, 'query') && queryDataSet && await queryDataSet.validate()) {
          dataSet.query();
        } else if (refEditors) {
          let hasFocus = false;
          for (const [key, value] of refEditors.entries()) {
            if (value && !value.valid && !hasFocus) {
              refEditors.get(key).focus();
              hasFocus = true;
            }
          }
        }
      }
    }
    onReset();
    onStatusChange(RecordStatus.sync);
  };

  const handleSave = async () => {
    const { current } = queryDataSet;
    if (current && conditionDataSet) {
      const conditionData = Object.entries(omit(current.toData(), ['__dirty']));
      conditionDataSet.reset();
      conditionDataSet.map(record => {
        if (!selectFields || !selectFields.includes(record.get('fieldName'))) {
          conditionDataSet.remove(record);
        }
        return null;
      });
      map(conditionData, data => {
        const fieldObj = findFieldObj(queryDataSet, data);
        if (fieldObj) {
          const { name } = fieldObj;
          if (name) {
            const currentRecord = conditionDataSet.find(record => record.get('fieldName') === name);
            if (currentRecord) {
              currentRecord.set('value', fieldObj.value);
              currentRecord.set('originalValue', fieldObj.originalValue);
            } else if (isSelect(data)) {
              conditionDataSet.create({
                fieldName: name,
                value: fieldObj.value,
                originalValue: fieldObj.originalValue,
              });
            }
          }
        }
      });
      const putData: any = [];
      map(selectFields, fieldName => {
        const value = current.get(fieldName);
        const statusKey = getConfig('statusKey');
        const statusAdd = getConfig('status').add;
        const status = {};
        const toJSONFields = conditionDataSet.toJSONData().map((condition) => (condition as { fieldName }).fieldName);
        status[statusKey] = statusAdd;
        // 处理空值已勾选条件
        if (!toJSONFields.includes(fieldName)) {
          putData.push({
            fieldName,
            value,
            ...status,
          });
        }
      });
      const data = [...conditionDataSet.toJSONData(), ...putData];
      const customizedColumns = tableStore && tableStore.customized && tableStore.customized.columns;
      filterSaveCallback({ personalFilter: stringifyValue(data), personalColumn: stringifyValue(customizedColumns)});
    } else {
      dataSet.query();
    }
  };


  return (
    <>
      {(conditionStatus === RecordStatus.update || !customizedChange) && (
        <div className={`${prefixCls}-combo-filter-buttons`}>
          {isChooseMenu && filterSave && (
            <Button onClick={handleSave} color={ButtonColor.primary}>
              {$l('Table', 'save_button')}
            </Button>
          )}
          <Button onClick={handleQueryReset} color={ButtonColor.secondary}>
            {$l('Table', 'reset_button')}
          </Button>
        </div>
      )}
    </>
  );
};

QuickFilterButton.displayName = 'QuickFilterButton';

export default observer(QuickFilterButton);
