import React, { useContext, useEffect } from 'react';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import { $l } from '../../../locale-context';
import Select from '../../../select';
import Record from '../../../data-set/Record';
import { RecordStatus } from '../../../data-set/enum';
import { hide, show } from '../../../tooltip/singleton';
import isOverflow from '../../../overflow-tip/util';
import {
  isEqualDynamicProps,
  parseValue,
  SELECTFIELDS,
} from '../TableDynamicFilterBar';
import Store from './QuickFilterMenuContext';
import Field from '../../../data-set/Field';

/**
 * 快速筛选下拉
 */
const QuickFilterMenu = function QuickFilterMenu() {
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
    onStatusChange = noop,
    onOriginalChange = noop,
    initConditionFields = noop,
    shouldLocateData,
    searchId,
    filterCallback = noop,
    filerMenuAction,
  } = useContext(Store);

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

  const handleChange = (value?: string) => {
    const { current } = queryDataSet;
    if (current) {
      current.reset();
    }
    locateData(value);
  };

  useEffect(() => {
    if (shouldLocateData) {
      locateData(searchId, true);
    }
  }, [shouldLocateData]);


  /**
   * 渲染下拉选项
   * @param record
   * @param text
   */
  const optionRenderer = ({ text }) => {
    return (
      <div className={`${prefixCls}-filter-menu-option`}>
        <span
          className={`${prefixCls}-filter-menu-option-content`}
          onMouseEnter={(e) => {
            const { currentTarget } = e;
            if (isOverflow(currentTarget)) {
              show(currentTarget, {
                title: text,
              });
            }
          }}
          onMouseLeave={() => hide()}
        >
          {text}
        </span>
      </div>
    );
  };

  return (
    <>
      <Select
        isFlat
        placeholder={$l('Table', 'fast_filter')}
        className={`${prefixCls}-filterName-select`}
        dataSet={filterMenuDataSet}
        name="filterName"
        dropdownMatchSelectWidth={false}
        dropdownMenuStyle={{ width: '1.98rem' }}
        popupCls={`${prefixCls}-filterName-select-content`}
        optionRenderer={optionRenderer}
        onChange={handleChange}
        notFoundContent={$l('Table', 'no_save_filter')}
        clearButton={false}
      />
      {filerMenuAction}
    </>
  );
};

QuickFilterMenu.displayName = 'ComboQuickFilterMenu';

export default observer(QuickFilterMenu);
