import React, { useContext, useEffect } from 'react';
import { runInAction } from 'mobx';
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
  RESETQUERYFIELDS,
  SELECTFIELDS,
} from '../TableComboBar';
import { isEqualDynamicProps, parseValue } from '../TableDynamicFilterBar';
import { TableCustomized } from '../../Table';

import Store from './QuickFilterMenuContext';

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
    // optionDataSet,
    shouldLocateData,
    initSearchId,
    filterCallback = noop,
    filterOptionRenderer = noop,
    tableStore,
  } = useContext(Store);

  /**
   * queryDS 筛选赋值并更新初始勾选项
   * @param init
   */
  const conditionAssign = (init?: boolean) => {
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
        if (!dataSet.getState(RESETQUERYFIELDS)) {
          onOriginalChange(Object.keys(initData));
          const emptyRecord = new Record({ ...initData }, queryDataSet);
          dataSet.setState(SELECTFIELDS, Object.keys(initData));
          shouldQuery = !isEqualDynamicProps(initData, currentQueryRecord ? omit(currentQueryRecord.toData(true), ['__dirty']) : {}, queryDataSet, currentQueryRecord);
          runInAction(() => {
            queryDataSet.records.push(emptyRecord);
            queryDataSet.current = emptyRecord;
          });
          onStatusChange(RecordStatus.sync, emptyRecord.toData());
        }
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
      dataSet.setState(RESETQUERYFIELDS, false);
      const customizedColumn = current.get('personalColumn') && parseValue(current.get('personalColumn'));
      if (tableStore && customizedColumn) {
        runInAction(() => {
          const newCustomized: TableCustomized = { columns: { ...customizedColumn } };
          tableStore.tempCustomized = { columns: {} };
          tableStore.saveCustomized(newCustomized);
          tableStore.initColumns();
        })
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
  const locateData = (searchId?: number | null, init?: boolean) => {
    const { current } = filterMenuDataSet;
    if (searchId) {
      filterCallback(searchId);
      menuDataSet.locate(menuDataSet.findIndex((menu) => menu.get('searchId').toString() === searchId.toString()));
      const menuRecord = menuDataSet.current;
      if (menuRecord) {
        const conditionList = menuRecord.get('personalFilter') && parseValue(menuRecord.get('personalFilter'));
        conditionDataSet.loadData(conditionList);
      }
      if (current) {
        current.set('filterName', searchId);
      }
      conditionAssign(init);
    } else if (searchId === null) {
      handleQueryReset();
    } else if (menuDataSet.length) {
      menuDataSet.locate(0);
      const menuRecord = menuDataSet.current;
      if (menuRecord) {
        const conditionList = menuRecord.get('personalFilter') && parseValue(menuRecord.get('personalFilter'));
        conditionDataSet.loadData(conditionList);
        if (current) {
          current.set('filterName', menuRecord.get('searchId'));
        }
        const customizedColumn = menuRecord.get('personalColumn') && parseValue(menuRecord.get('personalColumn'));
        if (tableStore) {
          runInAction(() => {
            const newCustomized: TableCustomized = { columns: { ...customizedColumn } };
            tableStore.tempCustomized = { columns: {} };
            tableStore.saveCustomized(newCustomized);
            tableStore.initColumns();
          })
        }
      }
      conditionAssign(init);
    } else if (current) {
      current.set('filterName', undefined);
    }
  };

  const handleChange = (value?: number) => {
    const { current } = queryDataSet;
    if (current) {
      current.reset();
    }
    locateData(value);
  };

  useEffect(() => {
    if (shouldLocateData) {
      locateData(initSearchId, true);
    }
  }, [shouldLocateData, initSearchId]);

  /**
   * 渲染下拉选项
   * @param record
   * @param text
   */
  const optionRenderer = ({ value, text }) => {
    const menuRecord = menuDataSet.find((menu) => menu.get('searchId').toString() === value.toString());
    const icon = menuRecord && menuRecord.get('searchIcon');
    return (
      <div className={`${prefixCls}-combo-filter-menu-option`}>
        <span
          className={`${prefixCls}-combo-filter-menu-option-content`}
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
          {filterOptionRenderer(value, text, icon) || text}
        </span>
      </div>
    );
  };

  return (
    <Select
      isFlat
      placeholder={$l('Table', 'fast_filter')}
      className={`${prefixCls}-combo-filterName-select`}
      popupCls={`${prefixCls}-combo-filterName-select-content`}
      dataSet={filterMenuDataSet}
      name="filterName"
      dropdownMatchSelectWidth={false}
      dropdownMenuStyle={{ width: '1.72rem' }}
      optionRenderer={optionRenderer}
      onChange={handleChange}
      notFoundContent={$l('Table', 'no_save_filter')}
      clearButton={false}
      searchable={false}
    />
  );
};

QuickFilterMenu.displayName = 'QuickFilterMenu';

export default observer(QuickFilterMenu);
