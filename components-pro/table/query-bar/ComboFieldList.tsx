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
type ComboFieldListProps = {
  closeMenu: () => void;
  value: string[];
  prefixCls: string;
  onSelect: (code: string | string[]) => void;
  onUnSelect: (code: string | string[]) => void;
  groups: Group[];
  fieldsLimit: number
}

const ComboFieldList: FunctionComponent<ComboFieldListProps> = function ComboFieldList({ value, onSelect, onUnSelect, groups, prefixCls, fieldsLimit }) {
  const [searchText, setSearchText] = useState('');
  const labelCodes = useMemo(() => groups.reduce((res, current) => [...res, ...current.fields.map((o) => [o.get('name'), o.get('label')])], []), [groups]);
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
          const label = field.get('label');
          const checked = isChecked(code);
          if (label && label.includes(searchText || '')) {
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

  const chooseRe = () => {
    const allValue = labelCodes.map(lc => {
      if (lc[1] && lc[1].includes(searchText || '')) {
        return lc[0]
      }
      return undefined;
    }).filter(v => !!v);
    const selected = value.slice(fieldsLimit);
    const reSelectedOptions = allValue.filter((i) => {
      const optionIsSelect = selected.some((v) => {
        return v === i;
      });
      return !optionIsSelect;
    });
    handleChange(selected, false);
    handleChange(reSelectedOptions, true);
  };

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
          placeholder={$l('Table', 'enter_search_filter')}
          clearButton
        />
      </div>
      <div className={`${prefixCls}-header`}>
        <span
          className={`${prefixCls}-search-action`}
          onClick={() => {
            const values = labelCodes.map(lc => {
              if (lc[1] && lc[1].includes(searchText || '')) {
                return lc[0]
              }
              return undefined;
            }).filter(v => !!v);
            handleChange(values, true);
          }}
        >
          {$l('Select', 'select_all')}
        </span>
        <span
          className={`${prefixCls}-search-action`}
          onClick={chooseRe}
        >
          {$l('Select', 'select_re')}
        </span>
        <span
          className={`${prefixCls}-search-action`}
          onClick={() => {
            const values = labelCodes.map(lc => {
              if (lc[1] && lc[1].includes(searchText || '')) {
                return lc[0]
              }
              return undefined;
            }).filter(v => !!v);
            handleChange(values, false);
          }}
        >
          {$l('Table', 'clear')}
        </span>
      </div>
      <div className={`${prefixCls}-content`}>
        {groups.map((group) => renderGroup(group))}
      </div>
    </div>
  );
};

ComboFieldList.displayName = 'ComboFieldList';

export default memo(ComboFieldList);
