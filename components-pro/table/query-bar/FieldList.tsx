import React, { FunctionComponent, useCallback, useMemo, useState, memo } from 'react';
import Icon from 'choerodon-ui/lib/icon';
import TextField from '../../text-field';
import CheckBox from '../../check-box';
import Field from '../../data-set/Field';
import { $l } from '../../locale-context';

interface Group {
  title: string;
  fields: Field[];
}

/**
 * value 勾选字段 + 已有非弹窗内有值的字段
 *
 * groups.fields 弹窗内字段
 */
type FieldListProps = {
  closeMenu: () => void;
  value: string[];
  prefixCls: string;
  onSelect: (code: string | string[]) => void;
  onUnSelect: (code: string | string[]) => void;
  groups: Group[];
}

const FieldList: FunctionComponent<FieldListProps> = function FieldList({ value, onSelect, onUnSelect, groups, prefixCls }) {
  const [searchText, setSearchText] = useState('');
  const codes = useMemo(() => groups.reduce((res, current) => [...res, ...current.fields.map((o) => {
    const hasBindProps = (propsName) => o && o.get(propsName) && o.get(propsName).bind;
    if (!o.get('bind') &&
      !hasBindProps('computedProps') &&
      !hasBindProps('dynamicProps')) {
      return o.get('name');
    }
    return undefined;
  })], []), [groups]);
  const labelCodes = useMemo(() => groups.reduce((res, current) => [...res, ...current.fields.map((o) => {
    const hasBindProps = (propsName) => o && o.get(propsName) && o.get(propsName).bind;
    if (!o.get('bind') &&
      !hasBindProps('computedProps') &&
      !hasBindProps('dynamicProps')) {
      return [o.get('name'), o.get('label')]
    }
    return undefined;
  })], []), [groups]);
  const hasSelect = useMemo(() => {
    const isSelect = labelCodes.some(lc => {
      if (lc && (lc[1] && lc[1].includes(searchText || '') || lc[1] === undefined)) {
        return value.includes(lc[0]);
      }
      return false;
    });
    return isSelect;
  }, [value.length, searchText]);
  const hasSelectAll = useMemo(() => {
    const isAll = labelCodes.some(lc => {
      if (lc && (lc[1] && lc[1].includes(searchText || '') || lc[1] === undefined)) {
        return !value.includes(lc[0]);
      }
      return false;
    });
    return !isAll;
  }, [searchText, value.length]);
  const isChecked = useCallback((code: string) => value.includes(code), [value]);
  const handleChange = useCallback((code: string | string[], select: boolean) => {
    if (select) {
      onSelect(code);
    } else {
      onUnSelect(code);
    }
  }, [onSelect, onUnSelect]);
  const renderGroup = useCallback((group: Group) => group.fields.length > 0 && (
    <div className={`${prefixCls}-section`} key={group.title}>
      <div className={`${prefixCls}-list`}>
        {group.fields.map((field) => {
          const code = field.get('name');
          const label = field.get('label') || code;
          const checked = isChecked(code);
          const hasBindProps = (propsName) => field && field.get(propsName) && field.get(propsName).bind;
          if (
            label && label.includes(searchText || '') &&
            !field.get('bind') &&
            !hasBindProps('computedProps') &&
            !hasBindProps('dynamicProps')) {
            return (
              <div className={`${prefixCls}-item`} key={code}>
                <CheckBox
                  value={code}
                  checked={checked}
                  onChange={() => handleChange(code, !checked)}
                >
                  {label}
                </CheckBox>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  ), [handleChange, isChecked, searchText]);

  const selectItems = value.filter(v => codes.includes(v));

  return (
    <div
      className={prefixCls}
    >
      <div className={`${prefixCls}-search`}>
        <TextField
          style={{ flex: 1 }}
          value={searchText}
          onClick={(e) => {
            e.preventDefault();
            e.currentTarget.focus();
          }}
          onChange={(v) => {
            setSearchText(v);
          }}
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchText(e.target.value);
          }}
          prefix={<Icon type="search" />}
          placeholder={$l('Table', 'enter_text_filter')}
          clearButton
        />
      </div>
      <div className={`${prefixCls}-header`}>
        <span className={`${prefixCls}-search-selected`}>
          {$l('Screening', 'selected')}
          <span className={`${prefixCls}-search-items`}>
            {selectItems.length}
          </span>
          {$l('Transfer', 'items')}
        </span>
        <span className={`${prefixCls}-search-divide`} />
        <span
          style={{ display: !hasSelectAll ? 'inline-block' : 'none' }}
          className={`${prefixCls}-search-action`}
          onClick={() => {
            const values = labelCodes.map(lc => {
              if (lc && (lc[1] && lc[1].includes(searchText || '') || lc[1] === undefined)) {
                return lc[0];
              }
              return undefined;
            }).filter(v => !!v);
            handleChange(values, true);
          }}
        >
          {$l('Select', 'select_all')}
        </span>
        <span
          style={{ display: hasSelect ? 'inline-block' : 'none' }}
          className={`${prefixCls}-search-action`}
          onClick={() => {
            const values = labelCodes.map(lc => {
              if (lc && (lc[1] && lc[1].includes(searchText || '') || lc[1] === undefined)) {
                return lc[0];
              }
              return undefined;
            }).filter(v => !!v);
            handleChange(values, false);
          }}
        >
          {$l('Table', 'clear_filter')}
        </span>
      </div>
      <div className={`${prefixCls}-content`}>
        {groups.map((group) => renderGroup(group))}
      </div>
    </div>
  );
};

FieldList.displayName = 'FieldList';

export default memo(FieldList);
