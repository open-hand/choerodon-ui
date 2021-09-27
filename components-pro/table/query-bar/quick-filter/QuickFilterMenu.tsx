import React, { FunctionComponent, memo, useContext, useEffect } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import isObject from 'lodash/isObject';
import isEnumEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';
import Icon from 'choerodon-ui/lib/icon';
import Tag from 'choerodon-ui/lib/tag';
import { getConfig } from 'choerodon-ui/lib/configure';

import isSampleEmpty from '../../../_util/isEmpty';
import { $l } from '../../../locale-context';
import Button from '../../../button';
import Select from '../../../select';
import Modal from '../../../modal';
import CheckBox from '../../../check-box';
import TextField from '../../../text-field';
import { ValueChangeAction } from '../../../text-field/enum';
import Dropdown from '../../../dropdown';
import Menu from '../../../menu';
import Record from '../../../data-set/Record';
import { RecordStatus } from '../../../data-set/enum';
import { hide, show } from '../../../tooltip/singleton';
import isOverflow from '../../../overflow-tip/util';

import Store from './QuickFilterDataSet';

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
  const keys = [...queryDataSet.fields.keys()];
  let name = data[0];
  let value = data[1];
  if (!keys.includes(data[0]) &&
    isObject(data[1]) &&
    !isEnumEmpty(data[1]) &&
    !isArray(data[1])) {
    name = `${data[0]}.${Object.keys(data[1])[0]}`;
    value = Object.values(data[1])[0];
  }
  if (queryDataSet.getField(name) && queryDataSet.getField(name).get('ignore') !== 'always') {
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
 * @param prefixCls
 * @param modal
 * @param menuDataSet
 * @param queryDataSet
 * @param onLocateData
 * @constructor
 */
const ModalContent: FunctionComponent<any> = memo(function ModalContent({ prefixCls, modal, menuDataSet, queryDataSet, onLoadData, type, selectFields }) {
  modal.handleOk(async () => {
    const putData: any[] = [];
    const statusKey = getConfig('statusKey');
    const statusAdd = getConfig('status').add;
    const status = {};
    status[statusKey] = statusAdd;
    if (type !== 'edit') {
      const conditionData = Object.entries(queryDataSet.current.toData());
      map(conditionData, data => {
        if (isSelect(data)) {
          const fieldObj = findFieldObj(queryDataSet, data);
          if (fieldObj?.name) {
            putData.push({
              comparator: 'EQUAL',
              fieldName: fieldObj.name,
              value: fieldObj.value,
              ...status,
            });
          }
        }
      });
      // 加入空值勾选字段
      const hasValueFields = putData.map(pt => pt.fieldName);
      map(selectFields, fieldName => {
        if (!hasValueFields.includes(fieldName)) {
          const value = queryDataSet.current.get(fieldName);
          putData.push({
            comparator: 'EQUAL',
            fieldName,
            value,
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
      menuDataSet.create({ ...otherRecord.toData(), searchId: undefined });
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
    menuDataSet.current.reset();
  });

  const proPrefixCls = getConfig('proPrefixCls');

  return (
    <>
      <div className={`${prefixCls}-filter-modal-item`}>
        <div className={`${proPrefixCls}-form ${proPrefixCls}-field-label ${proPrefixCls}-field-required`}>
          {$l('Table', 'filter_name')}
        </div>
        <TextField
          style={{ width: '100%' }}
          name="searchName"
          placeholder={$l('Table', 'please_enter')}
          showLengthInfo
          valueChangeAction={ValueChangeAction.input}
          dataSet={menuDataSet}
        />
      </div>
      {type !== 'edit' && (
        <div className={`${prefixCls}-filter-modal-item`}>
          <CheckBox
            name="defaultFlag"
            dataSet={menuDataSet}
          />
          <span className={`${proPrefixCls}-form ${proPrefixCls}-field-label`}>
            {$l('Table', 'set_default')}
          </span>
        </div>
      )}
    </>
  );
});

/**
 * 快速筛选下拉
 */
const QuickFilterMenu = observer(function QuickFilterMenu() {
  const {
    autoQuery,
    dataSet,
    menuDataSet,
    prefixCls,
    queryDataSet,
    filterMenuDS,
    conditionDataSet,
    onChange,
    // expand,
    conditionStatus,
    onStatusChange,
    selectFields,
    onOriginalChange,
  } = useContext(Store);

  const optionDs = filterMenuDS.getField('filterName').get('options');

  /**
   * queryDS 筛选赋值并更新初始勾选项
   */
  const conditionAssign = () => {
    onOriginalChange();
    const { conditionList } = menuDataSet.current.toData();
    const emptyRecord = new Record({}, queryDataSet);
    runInAction(() => {
      queryDataSet.records.push(emptyRecord);
      queryDataSet.current = emptyRecord;
    });
    if (conditionList && conditionList.length) {
      map(conditionList, condition => {
        if (condition.comparator === 'EQUAL') {
          const { fieldName, value } = condition;
          queryDataSet.current.set(fieldName, value);
          onChange(fieldName);
          onOriginalChange(fieldName);
        }
      });
      onStatusChange(RecordStatus.sync, queryDataSet.current.toData());
    } else {
      onStatusChange(RecordStatus.sync);
      if (autoQuery) {
        dataSet.query();
      }
    }
  };

  const handleQueryReset = () => {
    if (filterMenuDS.current?.get('filterName')) {
      // 筛选项重置重新赋值
      conditionAssign();
    } else {
      /**
       * 未选择或清除筛选项
       * 重置初始勾选项及初始赋值
       */
      onOriginalChange();
      queryDataSet.removeAll();
      queryDataSet.create({});
      if (autoQuery) {
        dataSet.query();
      }
    }
    onStatusChange(RecordStatus.sync);
  }

  /**
   * 定位数据源
   * @param searchId
   */
  const locateData = (searchId?: number) => {
    if (searchId) {
      menuDataSet.locate(menuDataSet.findIndex((menu) => menu.get('searchId').toString() === searchId.toString()));
      conditionDataSet.loadData(menuDataSet.current.get('conditionList'));
      if (filterMenuDS.current) filterMenuDS.current.set('filterName', searchId);
      conditionAssign();
    } else if (searchId === null) {
      handleQueryReset();
    } else {
      const defaultMenu = menuDataSet.findIndex((menu) => menu.get('defaultFlag'));
      if (defaultMenu !== -1) {
        menuDataSet.locate(defaultMenu);
        conditionDataSet.loadData(menuDataSet.current.get('conditionList'));
        if (filterMenuDS.current) filterMenuDS.current.set('filterName', menuDataSet.current.get('searchId'));
        conditionAssign();
      } else {
        if (filterMenuDS.current) filterMenuDS.current.set('filterName', undefined);
        queryDataSet.reset();
        queryDataSet.create({});
      }
    }
  };

  /**
   * 加载筛选数据并赋值查询
   * @param searchId
   */
  const loadData = async (searchId?: number) => {
    const result = await menuDataSet.query();
    optionDs.loadData(result);
    conditionDataSet.loadData(menuDataSet.current.get('conditionList'));
    if (result && result.length) {
      locateData(searchId);
    } else {
      if (filterMenuDS.current) filterMenuDS.current.set('filterName', undefined);
      locateData();
      if (dataSet.props.autoQuery) {
        dataSet.query();
      }
    }
  };

  const handleChange = (value?: number) => {
    locateData(value);
  }

  /**
   * 删除该条筛选
   * @param record 下拉数据源
   */
  async function handleDelete(record) {
    let searchId = record.get('searchId');
    if (menuDataSet.current) {
      const currentId = menuDataSet.current.get('searchId').toString();
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
      return $l('Table', 'filter_rename');
    default :
      return $l('Table', 'save_filter_as');
    }
  }

  function openModal(type, searchId?: string) {
    if (searchId) {
      menuDataSet.locate(menuDataSet.findIndex((menu) => menu.get('searchId').toString() === searchId.toString()));
      conditionDataSet.loadData(menuDataSet.current.get('conditionList'));
    }
    Modal.open({
      key: modalKey,
      closable: true,
      title: getTitle(type),
      children: (
        <ModalContent
          prefixCls={prefixCls}
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
    if (!filterMenuDS.current?.get('filterName')) {
      menuDataSet.create({});
      openModal('create');
    } else {
      const conditionData = Object.entries(queryDataSet.current.toData());
      conditionDataSet.reset();
      map(conditionData, (data) => {
        const fieldObj = findFieldObj(queryDataSet, data);
        if (fieldObj?.name) {
          const currentRecord = conditionDataSet.find(record => record.get('fieldName') === fieldObj.name);
          if (currentRecord) {
            if (isEmpty(fieldObj.value) || (isObject(fieldObj.value) && isEnumEmpty(fieldObj.value))) {
              conditionDataSet.remove(currentRecord);
            } else {
              currentRecord.set('value', fieldObj.value);
            }
          } else if (isSelect(data)) {
            conditionDataSet.create({
              fieldName: fieldObj.name,
              value: fieldObj.value,
            });
          }
        }
      });
      const putData: any = [];
      map(selectFields, fieldName => {
        const value = queryDataSet.current.get(fieldName);
        const statusKey = getConfig('statusKey');
        const statusAdd = getConfig('status').add;
        const status = {};
        const toJSONFields = conditionDataSet.toJSONData().map(condition => condition.fieldName);
        status[statusKey] = statusAdd;
        if (!toJSONFields.includes(fieldName)) {
          putData.push({
            comparator: 'EQUAL',
            fieldName,
            value,
            ...status,
          });
        }
      });
      menuDataSet.current.set('conditionList', { ...conditionDataSet.toJSONData(), ...putData });
      const res = await menuDataSet.submit();
      if (res && res.success) {
        loadData(res.content ? res.content[0].searchId : undefined);
      }
    }
  }

  const handleEdit = (record) => {
    openModal('edit', record.get('searchId'));
  }

  const handleSaveOther = () => {
    menuDataSet.current.set('searchName', '');
    menuDataSet.current.getField('searchName').validator.reset();
    openModal('save');
  }

  useEffect(() => {
    loadData();
  }, []);

  /**
   * 默认设置
   * @param defaultFlag
   * @param record
   */
  const setDefaultFlag = async (defaultFlag, record) => {
    record.set('defaultFlag', defaultFlag);
    const currentRecord = menuDataSet.find((menu) => menu.get('searchId').toString() === record.get('searchId').toString());
    currentRecord.set('defaultFlag', defaultFlag);
    const res = await menuDataSet.submit();
    const result = await menuDataSet.query();
    optionDs.loadData(result);
    if ((res && res.failed) || !res) {
      record.reset();
      currentRecord.reset();
    }
  };

  /**
   * 渲染下拉选项
   * @param record
   * @param text
   */
  const optionRenderer = ({ record, text }) => {
    const isSelected = filterMenuDS.current.get('filterName')?.toString() === record.get('searchId')?.toString();
    const isDefault = record.get('defaultFlag') === 1;
    const menu = (
      <Menu onClick={({ key, domEvent }) => {
        domEvent.preventDefault();
        domEvent.stopPropagation();
        if (key === 'filter_default') {
          setDefaultFlag(record?.get('defaultFlag') ? 0 : 1, record);
        } else if (key === 'filter_rename') {
          handleEdit(record);
        } else {
          handleDelete(record);
        }
      }}>
        <Menu.Item key='filter_default'>
          {record?.get('defaultFlag') ? $l('Table', 'cancel_default') : $l('Table', 'set_default')}
        </Menu.Item>
        <Menu.Item key='filter_rename'>
          {$l('Table', 'rename')}
        </Menu.Item>
        <Menu.Item key='filter_delete'>
          <span style={{ color: '#F13131' }}>
            {$l('Table', 'delete_button')}
          </span>
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
          // @ts-expect-error: bad code here
          onMouseLeave={hide}
        >
          {text}
          {isDefault && <Tag>{$l('Table', 'default_flag')}</Tag>}
        </span>
        {isSelected && <div className={`${prefixCls}-filter-menu-option-selected`}>
          <Icon type="check" />
        </div>}
        <div className={`${prefixCls}-filter-menu-option-icons`}>
          <Dropdown overlay={menu}>
            <span style={{ userSelect: 'none' }}><Icon type="more_horiz" /></span>
          </Dropdown>
        </div>
      </div>
    );
  };

  return (
    <>
      <Select
        isFlat
        placeholder={$l('Table', 'fast_filter')}
        className={`${prefixCls}-filterName-select`}
        dataSet={filterMenuDS}
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
          {filterMenuDS.current?.get('filterName') && (
            <Button onClick={handleSaveOther}>
              {$l('Table', 'save_as')}
            </Button>
          )}
          <Button onClick={handleSave}>
            {$l('Table', 'save_button')}
          </Button>
          <Button onClick={handleQueryReset}>
            {$l('Table', 'reset_button')}
          </Button>
        </div>
      )}
    </>
  );
});

QuickFilterMenu.displayName = 'QuickFilterMenu';

export default QuickFilterMenu;
