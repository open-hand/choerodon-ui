import React, { useContext, useEffect } from 'react';
import { isArrayLike, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import Icon from 'choerodon-ui/lib/icon';
import { getConfig } from 'choerodon-ui/lib/configure';

import isSampleEmpty from '../../../_util/isEmpty';
import { $l } from '../../../locale-context';
import Button from '../../../button';
import { ButtonColor } from '../../../button/enum';
import Select from '../../../select';
import Modal from '../../../modal';
import CheckBox from '../../../check-box';
import TextField from '../../../text-field';
import Tooltip from '../../../tooltip';
import Record from '../../../data-set/Record';

import Store from './QuickFilterDataSet';

const modalKey = Modal.key();


/**
 * 判断查询值是否为空
 * @param value
 */
function isEmpty(value) {
  return isArrayLike(value) ? !value.length : isSampleEmpty(value);
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
const ModalContent: React.FC<any> = ({ prefixCls, modal, menuDataSet, queryDataSet, onLoadData, type }) => {
  modal.handleOk(async () => {
    const putData:any[] = [];
    if (type !== 'edit') {
      const conditionData = Object.entries(queryDataSet.current.toData());
      map(conditionData, data => {
        if (data[0] !== '__dirty' && !isEmpty(data[1])) {
          putData.push({
            comparator: 'EQUAL',
            fieldName: data[0],
            value: data[1],
          });
        }
      });
    }
    if (type === 'save') {
      const otherRecord = menuDataSet.current.clone();
      otherRecord.set('conditionList', putData);
      menuDataSet.current.reset();
      menuDataSet.create({ ...otherRecord.toData(), searchId: undefined });
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
};

/**
 * 快速筛选下拉
 */
const QuickFilterMenu = observer(() => {
  const {
    dataSet,
    menuDataSet,
    prefixCls,
    queryDataSet,
    filterMenuDS,
    onChange,
    expand,
  } = useContext(Store);

  const optionDs = filterMenuDS.getField('filterName').get('options');

  /**
   * queryDS 筛选赋值
   */
  const conditionAssign = () => {
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
          if (isArrayLike(value) ? value.length : !isEmpty(value)) {
            onChange(fieldName);
          }
        }
      });
    } else {
      dataSet.query();
    }
  };

  /**
   * 定位数据源
   * @param searchId
   */
  const locateData = (searchId?: number) => {
    if (searchId) {
      menuDataSet.locate(menuDataSet.findIndex((menu) => menu.get('searchId') === searchId));
      if (filterMenuDS.current) filterMenuDS.current.set('filterName', searchId);
      conditionAssign();
    } else if (searchId === null) {
      queryDataSet.reset();
      queryDataSet.create({});
    } else {
      const defaultMenu = menuDataSet.findIndex((menu) => menu.get('defaultFlag'));
      if (defaultMenu !== -1) {
        menuDataSet.locate(defaultMenu);
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


  function handleChange(value?: number) {
    locateData(value);
  }

  /**
   * 删除该条筛选
   * @param record 下拉数据源
   */
  async function handleDelete(record) {
    let searchId = record.get('searchId');
    if (menuDataSet.current) {
      const currentId = menuDataSet.current.get('searchId');
      searchId = record.get('searchId') === currentId ? undefined : currentId;
    }
    const delRecord = menuDataSet.find((menu) => menu.get('searchId') === record.get('searchId'));
    await menuDataSet.delete(delRecord, `${$l('Table', 'whether_delete_filter')}：${record.get('searchName')}？`);
    loadData(searchId);
  }

  function handleQueryReset() {
    const { current } = queryDataSet;
    if (filterMenuDS.current?.get('filterName')) {
      conditionAssign();
    } else {
      current.reset();
      const conditionData = Object.entries(current.toData());
      const keys = [...queryDataSet.fields.keys()];
      map(conditionData, data => {
        const isSelect = data[0] !== '__dirty' && !isEmpty(data[1]);
        if (!keys.includes(data[0]) && isSelect ) {
          onChange(keys.filter(k => k.includes(`${data[0]}.`)));
        }
        if (isSelect) {
          onChange(data[0]);
        }
      });
      dataSet.query();
    }
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

  function openModal(type, searchId?: String) {
    if (searchId) {
      menuDataSet.locate(menuDataSet.findIndex((menu) => menu.get('searchId') === searchId));
    }
    Modal.open({
      key: modalKey,
      closable: true,
      title: getTitle(type),
      children: <ModalContent prefixCls={prefixCls} type={type} menuDataSet={menuDataSet} onLoadData={loadData} queryDataSet={queryDataSet} />,
      okFirst: false,
      destroyOnClose: true,
    });
  }

  async function handleSave() {
    if (!filterMenuDS.current?.get('filterName')) {
      menuDataSet.create({});
      openModal('create')
    } else {
      const conditionData = Object.entries(queryDataSet.current.toData());
      const putData: any[] = [];
      map(conditionData, data => {
        if (data[0] !== '__dirty' && !isEmpty(data[1])) {
          putData.push({
            comparator: 'EQUAL',
            fieldName: data[0],
            value: data[1],
          });
        }
      });
      menuDataSet.current.set('conditionList', putData);
      const res = await menuDataSet.submit();
      if (res && res.success) {
        loadData(res.content ? res.content[0].searchId : undefined);
      }
    }
  }

  function handleEdit(record) {
    openModal('edit', record.get('searchId'))
  }

  function handleSaveOther() {
    menuDataSet.current.set('searchName', '');
    menuDataSet.current.getField('searchName').validator.reset();
    openModal('save')
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
    const currentRecord = menuDataSet.find((menu) => menu.get('searchId') === record.get('searchId'));
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
    return (
      <div className={`${prefixCls}-filter-menu-option`}>
        {text}
        <div className={`${prefixCls}-filter-menu-option-icons`}>
          <Tooltip title={record?.get('defaultFlag') ? $l('Table', 'cancel_default') : $l('Table', 'set_default')}>
            {record?.get('defaultFlag') ? (
                <Icon
                  type="check_circle"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDefaultFlag(0, record);
                  }}
                />
              ) :
              (
                <Icon
                  type="finished"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDefaultFlag(1, record);
                  }}
                />
              )}
          </Tooltip>
          <Tooltip title={$l('Table', 'rename')}>
            <Icon
              type="edit-o"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEdit(record);
              }}
            />
          </Tooltip>
          <Tooltip title={$l('Table', 'delete_button')}>
            <Icon
              type="delete_forever-o"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete(record);
              }}
            />
          </Tooltip>
        </div>
      </div>
    );
  };

  return (
    <>
      <Icon type="sort" style={{ transform: 'rotateY(180deg)' }} />
      <Select
        isFlat
        placeholder={$l('Table', 'fast_filter')}
        style={{ border: 'none', minWidth: '0.9rem' }}
        dataSet={filterMenuDS}
        name="filterName"
        dropdownMatchSelectWidth={false}
        dropdownMenuStyle={{ minWidth: '2rem' }}
        optionRenderer={optionRenderer}
        onChange={handleChange}
      />
      {queryDataSet.current?.dirty && (
        <div className={`${prefixCls}-filter-buttons`} style={expand ? {} : { display: 'none' }}>
          <Button color={ButtonColor.primary} onClick={handleSave}>
            {$l('Table', 'save_filter')}
          </Button>
          {filterMenuDS.current?.get('filterName') && (
            <Button onClick={handleSaveOther}>
              {$l('Table', 'save_as')}
            </Button>
          )}
          <Button onClick={handleQueryReset}>
            {$l('Table', 'reset_button')}
          </Button>
        </div>
      )}
    </>
  );
});

export default QuickFilterMenu;
