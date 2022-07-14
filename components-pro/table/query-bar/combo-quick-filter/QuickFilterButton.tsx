import React, { useContext } from 'react';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import isObject from 'lodash/isObject';
import isEnumEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import isSampleEmpty from '../../../_util/isEmpty';
import { $l } from '../../../locale-context';
import Button from '../../../button';
import { ButtonColor } from '../../../button/enum';
import Record from '../../../data-set/Record';
import { RecordStatus } from '../../../data-set/enum';
import {
  isEqualDynamicProps,
  omitData,
  parseValue,
  SELECTFIELDS,
  stringifyValue,
} from '../TableComboBar';

import Store from './QuickFilterMenuContext';
import Field from '../../../data-set/Field';

/**
 * 判断查询值是否为空
 * @param value
 */
function isEmpty(value) {
  return isArray(value) ? !value.length : isSampleEmpty(value);
}

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
 * 当前数据是否有值并需要选中
 * @param data
 */
function isSelect(data) {
  if (isObject(data[1])) {
    return !isEnumEmpty(data[1]);
  }
  return data[0] !== '__dirty' && !isEmpty(data[1]);
}

/**
 * 快速筛选下拉
 */
const QuickFilterButton = function QuickFilterButton() {
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
    initConditionFields = noop,
    optionDataSet,
    filterSaveCallback = noop,
    customizedColumns,
    filterCallback = noop,
  } = useContext(Store);
  const isChooseMenu = filterMenuDataSet && filterMenuDataSet.current && filterMenuDataSet.current.get('filterName');

  /**
   * 替换个性化字段
   * @param conditionList
   */
  const initCustomFields = (conditionList): void => {
    const fields = conditionList.map(condition => {
      return {
        ...condition,
        name: condition.fieldName,
        defaultValue: condition.value,
      };
    });
    runInAction(() => {
      queryDataSet.fields = observable.map<string, Field>(conditionList ? queryDataSet.initFields(fields) : undefined);
    });
  };

  /**
   * queryDS 筛选赋值并更新初始勾选项
   * @param init
   */
  const conditionAssign = (init?: boolean) => {
    onOriginalChange();
    const { current } = menuDataSet;
    let shouldQuery = false;
    if (current) {
      const conditionList = current.get('conditionList');
      const initData = {};
      const tenantSelectFields: string[] = [];
      const isTenant = current.get('isTenant');
      if (isTenant) {
        initCustomFields(conditionList);
      } else if (tempQueryFields) {
        runInAction(() => {
          queryDataSet.fields = tempQueryFields;
        });
      }
      const { current: currentQueryRecord } = queryDataSet;
      if (conditionList && conditionList.length) {
        map(conditionList, condition => {
          if (condition.comparator === 'EQUAL') {
            const { fieldName, value } = condition;
            initData[fieldName] = parseValue(value);
            onChange(fieldName);
          }
          if (condition.usedFlag) {
            tenantSelectFields.push(condition.fieldName)
          }
        });
        onOriginalChange(Object.keys(initData));
        const emptyRecord = new Record({ ...initData }, queryDataSet);
        dataSet.setState(SELECTFIELDS, isTenant ? tenantSelectFields : Object.keys(initData));
        shouldQuery = !isEqualDynamicProps(initData, currentQueryRecord ? omit(currentQueryRecord.toData(true), ['__dirty']) : {}, queryDataSet, currentQueryRecord);
        runInAction(() => {
          queryDataSet.records.push(emptyRecord);
          queryDataSet.current = emptyRecord;
        });
        if (isTenant) {
          initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current } );
        }
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
      if (!init && shouldQuery && autoQuery) {
        dataSet.query();
      }
    }
  };

  const handleQueryReset = () => {
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
        dataSet.query();
      }
    }
    onStatusChange(RecordStatus.sync);
  };

  /**
   * 定位数据源
   * @param searchId
   * @param init 初始化
   */
  const locateData = (searchId?: string | null, init?: boolean) => {
    const { current } = filterMenuDataSet;
    if (searchId) {
      menuDataSet.locate(menuDataSet.findIndex((menu) => menu.get('searchId').toString() === searchId.toString()));
      const menuRecord = menuDataSet.current;
      if (menuRecord) {
        conditionDataSet.loadData(menuRecord.get('conditionList'));
      }
      if (current) {
        current.set('filterName', searchId);
      }
      conditionAssign(init);
      filterCallback(searchId);
    } else if (searchId === null) {
      handleQueryReset();
    } else {
      menuDataSet.locate(0);
      const menuRecord = menuDataSet.current;
      if (menuRecord) {
        conditionDataSet.loadData(menuRecord.get('conditionList'));
        if (current) {
          current.set('filterName', menuRecord.get('searchId'));
        }
      }
      conditionAssign(init);
    }
  };

  /**
   * 加载筛选数据并赋值查询
   * @param searchId
   */
  const loadData = async (searchId?: string) => {
    const result = await menuDataSet.query();
    if (optionDataSet) {
      optionDataSet.loadData(result);
    }
    const menuRecord = menuDataSet.current;
    if (menuRecord) {
      conditionDataSet.loadData(menuRecord.get('conditionList'));
    }
    if (result && result.length) {
      locateData(searchId);
    } else {
      const { current } = filterMenuDataSet;
      if (current) current.set('filterName', undefined);
      locateData();
      if (dataSet.props.autoQuery) {
        dataSet.query();
      }
    }
  };

  const filerSave = async (menuDataSet) => {
    conditionDataSet.loadData(menuDataSet.current.get('conditionList'));
    const putData: any[] = [];
    const conditionData = Object.entries(omit(queryDataSet.current && queryDataSet.current.toData(), ['__dirty']));
    map(conditionData, data => {
      if (isSelect(data)) {
        const fieldObj = findFieldObj(queryDataSet, data);
        if (fieldObj && fieldObj.name) {
          putData.push({
            fieldName: fieldObj.name,
            value: stringifyValue(fieldObj.value),
          });
        }
      }
    });
    const hasValueFields = putData.map(pt => pt.fieldName);
    map(selectFields, fieldName => {
      const value = queryDataSet.current && queryDataSet.current.get(fieldName);
      // 加入空值勾选字段
      if (!hasValueFields.includes(fieldName)) {
        putData.push({
          fieldName,
          value: stringifyValue(value),
        });
      }
    });
    const otherRecord = menuDataSet.current.clone();
    otherRecord.set('conditionList', putData);
    menuDataSet.current.reset();
    filterSaveCallback({ ...omitData(otherRecord.toData()), personalColumns: customizedColumns })
    const res = await menuDataSet.submit();
    if (res && res.success) {
      loadData(res.content ? res.content[0].searchId : undefined);
      return true;
    }
    return !((res && res.failed) || !res);
  }

  const handleSaveOther = () => {
    const { current } = menuDataSet;
    if (!current) {
      menuDataSet.locate(0);
    }
    filerSave(menuDataSet);

  };

  return (
    <>
      {conditionStatus === RecordStatus.update && (
        <div className={`${prefixCls}-combo-filter-button`}>
          {isChooseMenu && (
            <Button onClick={handleSaveOther} color={ButtonColor.primary}>
              {$l('Table', 'save_as')}
            </Button>
          )}
          <Button onClick={handleQueryReset}>
            {$l('Table', 'reset_button')}
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              dataSet.query();
            }}
          >
            {$l('Table', 'query_button')}
          </Button>
        </div>
      )}
    </>
  );
};

QuickFilterButton.displayName = 'ComboQuickFilterButton';

export default observer(QuickFilterButton);
