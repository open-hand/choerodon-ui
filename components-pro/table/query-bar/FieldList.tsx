import React, { useCallback, useMemo, useState } from 'react';
import Icon from 'choerodon-ui/lib/icon';
import Button from '../../button';
import TextField from '../../text-field';
import CheckBox from '../../check-box';
import Field from '../../data-set/Field';
import { FuncType } from '../../button/enum';
import { $l } from '../../locale-context';

interface Group {
  title: string,
  fields: Field[],
}

/**
 * value 勾选字段 + 已有非弹窗内有值的字段
 *
 * groups.fields 弹窗内字段
 */
type Props = {
  closeMenu: () => void,
  value: string[]
  prefixCls: string
  onSelect: (code: string | string[]) => void
  onUnSelect: (code: string | string[]) => void
  groups: Group[]
}

const FieldList: React.FC<Props> = ({ closeMenu, value, onSelect, onUnSelect, groups, prefixCls }) => {
  const [searchText, setSearchText] = useState('');
  const codes = useMemo(() => groups.reduce((res, current) => [...res, ...current.fields.map((o) => o.get('name'))], []), [groups]);
  const hasSelect = useMemo(() => value.length > 0, [value.length]);
  const hasSelectAll = useMemo(() => value.length >= codes.length, [codes.length, value.length]);
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
      <div className={`${prefixCls}-title`}>{group.title}</div>
      <div className={`${prefixCls}-list`}>
        {group.fields.map((field) => {
          const code = field.get('name');
          const label = field.get('label');
          const checked = isChecked(code);
          if (label.includes(searchText || '')) {
            return (
              <div className={`${prefixCls}-item`} key={code}>
                <CheckBox
                  value={code}
                  disabled={field.get('disabled')}
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
          onInput={(e) => {
            // @ts-ignore
            setSearchText(e.target.value);
          }}
          prefix={<Icon type="search" />}
          placeholder={$l('Table', 'enter_text_filter')}
          clearButton
        />
      </div>
      <div className={`${prefixCls}-header`}>
        <CheckBox
          indeterminate={!hasSelectAll && hasSelect}
          checked={hasSelectAll}
          onChange={(checkAll) => {
            if (checkAll) {
              // 避免焦点丢失时无法再次点击添加筛选
              closeMenu();
              // TODO: 过滤disabled的code 如果存在
              handleChange(codes, true);
            } else {
              handleChange(codes, false);
            }
          }}
        >
          {$l('Select', 'select_all')}
        </CheckBox>
        <Button
          style={{ display: hasSelect ? 'inline-block' : 'none' }}
          funcType={FuncType.flat}
          onClick={() => {
            handleChange(codes, false);
          }}
        >
          {$l('Table', 'clear_filter')}
        </Button>
      </div>
      <div className={`${prefixCls}-content`}>
        {groups.map((group) => renderGroup(group))}
      </div>
    </div>
  );
};
export default FieldList;
