import React, { FunctionComponent, memo, useContext, useEffect } from 'react';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import isObject from 'lodash/isObject';
import isEnumEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import Icon from 'choerodon-ui/lib/icon';
import Tag from 'choerodon-ui/lib/tag';
import isSampleEmpty from '../../../_util/isEmpty';
import { $l } from '../../../locale-context';
import Button from '../../../button';
import Select from '../../../select';
import Modal from '../../../modal';
import TextField from '../../../text-field';
import { ValueChangeAction } from '../../../text-field/enum';
import Dropdown from '../../../dropdown';
import Menu from '../../../menu';
import Form from '../../../form';
import Switch from '../../../switch';
import SelectBox from '../../../select-box';
import Record from '../../../data-set/Record';
import { RecordStatus } from '../../../data-set/enum';
import { hide, show } from '../../../tooltip/singleton';
import isOverflow from '../../../overflow-tip/util';
import {
  isEqualDynamicProps,
  omitData,
  parseValue,
  SELECTCHANGE,
  SELECTFIELDS,
  stringifyValue,
} from '../TableDynamicFilterBar';

import Store from './QuickFilterMenuContext';
import Field from '../../../data-set/Field';

const modalKey = Modal.key();

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
 * 编辑/新建筛选弹窗
 * @param modal
 * @param menuDataSet
 * @param queryDataSet
 * @param onLoadData
 * @param type
 * @param selectFields
 * @constructor
 */
const ModalContent: FunctionComponent<any> = function ModalContent({ modal, menuDataSet, queryDataSet, onLoadData, type, selectFields }) {
  const { getConfig } = useContext(ConfigContext);
  modal.handleOk(async () => {
    const putData: any[] = [];
    const statusKey = getConfig('statusKey');
    const statusAdd = getConfig('status').add;
    const shouldSaveValue = menuDataSet.current.get('saveFilterValue');
    const status = {};
    status[statusKey] = statusAdd;
    if (type !== 'edit') {
      const conditionData = Object.entries(omit(queryDataSet.current.toData(), ['__dirty']));
      map(conditionData, data => {
        if (isSelect(data)) {
          const fieldObj = findFieldObj(queryDataSet, data);
          if (fieldObj && fieldObj.name) {
            putData.push({
              comparator: 'EQUAL',
              fieldName: fieldObj.name,
              value: shouldSaveValue ? stringifyValue(fieldObj.value) : '',
              ...status,
            });
          }
        }
      });
      const hasValueFields = putData.map(pt => pt.fieldName);
      map(selectFields, fieldName => {
        const value = queryDataSet.current.get(fieldName);
        // 加入空值勾选字段
        if (!hasValueFields.includes(fieldName)) {
          putData.push({
            comparator: 'EQUAL',
            fieldName,
            value: shouldSaveValue ? stringifyValue(value) : '',
            ...status,
          });
        }
      });
    }
    // 另存为
    if (type === 'save') {
      const otherRecord = menuDataSet.current.clone();
      otherRecord.set('conditionList', putData);
      menuDataSet.current.reset();
      menuDataSet.create({ ...omitData(otherRecord.toData()) });
      // 新建
    } else if (type === 'create') {
      menuDataSet.current.set('conditionList', putData);
    }
    const res = await menuDataSet.submit();
    if (res && res.success) {
      onLoadData(res.content ? res.content[0].searchId : undefined);
      return true;
    }
    return !((res && res.failed) || !res);
  });

  modal.handleCancel(() => {
    menuDataSet.reset();
  });

  return (
    <Form dataSet={menuDataSet}>
      <TextField
        style={{ width: '100%' }}
        name="searchName"
        placeholder={$l('Table', 'please_enter')}
        showLengthInfo
        valueChangeAction={ValueChangeAction.input}
      />
      <SelectBox name="saveFilterValue">
        <SelectBox.Option value={1}>{$l('Table', 'query_option_yes')}</SelectBox.Option>
        <SelectBox.Option value={0}>{$l('Table', 'query_option_no')}</SelectBox.Option>
      </SelectBox>
      <Switch name="defaultFlag" hidden={type === 'edit'} />
    </Form>
  );
};

ModalContent.displayName = 'ModalContent';

const MemoModalContent = memo(ModalContent);

/**
 * 快速筛选下拉
 */
const QuickFilterMenu = function QuickFilterMenu() {
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
    initConditionFields = noop,
    optionDataSet,
    shouldLocateData,
    refEditors,
  } = useContext(Store);
  const isChooseMenu = filterMenuDataSet && filterMenuDataSet.current && filterMenuDataSet.current.get('filterName');
  const isTenant = menuDataSet && menuDataSet.current && menuDataSet.current.get('isTenant');
  const shouldSaveValue = menuDataSet && menuDataSet.current && menuDataSet.current.get('saveFilterValue');

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
            tenantSelectFields.push(condition.fieldName);
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
          initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current });
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
      menuDataSet.locate(menuDataSet.findIndex((menu) => menu.get('searchId').toString() === searchId.toString()));
      const menuRecord = menuDataSet.current;
      if (menuRecord) {
        conditionDataSet.loadData(menuRecord.get('conditionList'));
      }
      if (current) {
        current.set('filterName', searchId);
      }
      conditionAssign(init);
    } else if (searchId === null) {
      handleQueryReset();
    } else {
      const defaultMenus = menuDataSet.filter((menu) => menu.get('defaultFlag'));
      const defaultMenu = defaultMenus.length > 1 ? defaultMenus.find((menu) => menu.get('isTenant') !== 1)!.index : defaultMenus.length && defaultMenus[0].index;
      if (defaultMenus.length && defaultMenu !== -1) {
        menuDataSet.locate(defaultMenu);
        const menuRecord = menuDataSet.current;
        if (menuRecord) {
          conditionDataSet.loadData(menuRecord.get('conditionList'));
          if (current) {
            current.set('filterName', menuRecord.get('searchId'));
          }
        }
        conditionAssign(init);
      } else if (current) {
        current.set('filterName', undefined);
      }
    }
  };

  /**
   * 加载筛选数据并赋值查询
   * @param searchId
   */
  const loadData = async (searchId?: number) => {
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

  const handleChange = (value?: number) => {
    const { current } = queryDataSet;
    if (current) {
      current.reset();
    }
    locateData(value);
  };

  /**
   * 删除该条筛选
   * @param record 下拉数据源
   */
  async function handleDelete(record) {
    let searchId = record.get('searchId');
    const menuRecord = menuDataSet.current;
    if (menuRecord) {
      const currentId = menuRecord.get('searchId').toString();
      searchId = record.get('searchId').toString() === currentId ? undefined : currentId;
    }
    const delRecord = menuDataSet.find((menu) => menu.get('searchId').toString() === record.get('searchId').toString());
    await menuDataSet.delete(delRecord, `${$l('Table', 'whether_delete_filter')}：${record.get('searchName')}？`);
    loadData(searchId);
  }

  function getTitle(type) {
    switch (type) {
      case 'create':
        return $l('Table', 'save_filter');
      case 'edit':
        return $l('Table', 'filter_edit');
      default :
        return $l('Table', 'save_filter_as');
    }
  }

  function openModal(type, searchId?: string) {
    if (searchId) {
      menuDataSet.locate(menuDataSet.findIndex((menu) => menu.get('searchId').toString() === searchId.toString()));
      const menuRecord = menuDataSet.current;
      if (menuRecord) {
        conditionDataSet.loadData(menuRecord.get('conditionList'));
      }
    }
    Modal.open({
      key: modalKey,
      closable: true,
      title: getTitle(type),
      children: (
        <MemoModalContent
          type={type}
          menuDataSet={menuDataSet}
          conditionDataSet={conditionDataSet}
          onLoadData={loadData}
          queryDataSet={queryDataSet}
          selectFields={selectFields}
        />
      ),
      okFirst: false,
      destroyOnClose: true,
    });
  }

  const handleSave = async () => {
    const filterMenuRecord = filterMenuDataSet ? filterMenuDataSet.current : undefined;
    if ((!filterMenuRecord || !filterMenuRecord.get('filterName')) && menuDataSet) {
      menuDataSet.create({});
      openModal('create');
    } else {
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
              } else if (isSelect(data)) {
                conditionDataSet.create({
                  fieldName: name,
                  value: fieldObj.value,
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
              comparator: 'EQUAL',
              fieldName,
              value,
              ...status,
            });
          }
        });
        const menuRecord = menuDataSet.current;
        if (menuRecord) {
          menuRecord.set('conditionList', [...conditionDataSet.toJSONData(), ...putData]);
        }
        const res = await menuDataSet.submit();
        if (res && res.success) {
          loadData(res.content ? res.content[0].searchId : undefined);
        }
      } else {
        dataSet.query();
      }
    }
  };

  /**
   * 重命名，定位到重命名记录
   * @param record
   */
  const handleEdit = (record) => {
    locateData(record.get('searchId'));
    openModal('edit', record.get('searchId'));
  };

  const handleSaveOther = () => {
    const { current } = menuDataSet;
    if (current) {
      const searchName = current.get('searchName');
      current.set('searchName', `${searchName}_copy`);
    }
    openModal('save');
  };

  useEffect(() => {
    if (shouldLocateData) {
      locateData(undefined, true);
    }
  }, [shouldLocateData, menuDataSet && menuDataSet.length]);

  /**
   * 默认设置
   * @param defaultFlag
   * @param record
   */
  const setDefaultFlag = async (defaultFlag, record) => {
    record.set('defaultFlag', defaultFlag);
    const currentRecord = menuDataSet.find((menu) => menu.get('searchId').toString() === record.get('searchId').toString());
    if (currentRecord) {
      currentRecord.set('defaultFlag', defaultFlag);
    }
    const res = await menuDataSet.submit();
    const result = await menuDataSet.query();
    if (optionDataSet) {
      optionDataSet.loadData(result);
    }
    if ((res && res.failed) || !res) {
      record.reset();
      if (currentRecord) {
        currentRecord.reset();
      }
    }
  };

  /**
   * 渲染下拉选项
   * @param record
   * @param text
   */
  const optionRenderer = ({ record, text }) => {
    const filterMenuRecord = filterMenuDataSet.current;
    const isSelected = String(filterMenuRecord && filterMenuRecord.get('filterName')) === String(record.get('searchId'));
    const isDefault = record.get('defaultFlag') === 1;
    const isTenant = record.get('isTenant') === $l('Table', 'preset');
    const menu = (
      <Menu onClick={({ key, domEvent }) => {
        domEvent.preventDefault();
        domEvent.stopPropagation();
        if (key === 'filter_default') {
          setDefaultFlag(record.get('defaultFlag') ? 0 : 1, record);
        } else if (key === 'filter_edit') {
          handleEdit(record);
        } else {
          handleDelete(record);
        }
      }}>
        <Menu.Item key='filter_default'>
          {record.get('defaultFlag') ? $l('Table', 'cancel_default') : $l('Table', 'set_default')}
        </Menu.Item>
        <Menu.Item key='filter_edit'>
          {$l('Table', 'filter_edit')}
        </Menu.Item>
        <Menu.Item key='filter_delete'>
          {$l('Table', 'delete_button')}
        </Menu.Item>
      </Menu>
    );
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
        {isDefault && <Tag>{$l('Table', 'default_flag')}</Tag>}
        {isSelected && <div className={`${prefixCls}-filter-menu-option-selected`}>
          <Icon type="check" />
        </div>}
        {!isTenant && (
          <div className={`${prefixCls}-filter-menu-option-icons`}>
            <Dropdown overlay={menu}>
              <span style={{ userSelect: 'none' }}><Icon type="more_horiz" /></span>
            </Dropdown>
          </div>
        )}
      </div>
    );
  };

  // 租户预置筛选及仅保存条件时，无保存按钮
  return (
    <>
      <Select
        isFlat
        placeholder={$l('Table', 'fast_filter')}
        className={`${prefixCls}-filterName-select`}
        dataSet={filterMenuDataSet}
        name="filterName"
        dropdownMatchSelectWidth={false}
        dropdownMenuStyle={{ width: '1.72rem' }}
        optionRenderer={optionRenderer}
        onChange={handleChange}
        notFoundContent={$l('Table', 'no_save_filter')}
      />
      {conditionStatus === RecordStatus.update ? (
        <Tag className={`${prefixCls}-filter-status`}>
          <span>{$l('Table', 'modified')}</span>
        </Tag>
      ) : null}
      {conditionStatus === RecordStatus.update && (
        <div className={`${prefixCls}-filter-buttons`}>
          {isChooseMenu && (
            <Button onClick={handleSaveOther}>
              {$l('Table', 'save_as')}
            </Button>
          )}
          {(isChooseMenu ? isTenant || (conditionStatus === RecordStatus.update && dataSet.getState(SELECTCHANGE) && !shouldSaveValue) && menuDataSet && menuDataSet.length : false) ? null : (
            <Button onClick={handleSave}>
              {$l('Table', 'save_button')}
            </Button>
          )}
          <Button onClick={handleQueryReset}>
            {$l('Table', 'reset_button')}
          </Button>
        </div>
      )}
    </>
  );
};

QuickFilterMenu.displayName = 'QuickFilterMenu';

export default observer(QuickFilterMenu);
