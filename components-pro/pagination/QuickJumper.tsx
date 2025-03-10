import React, { FunctionComponent, ReactNode, useCallback, useState } from 'react';
import classNames from 'classnames';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { $l } from '../locale-context';
import ObserverNumberField from '../number-field/NumberField';
import { ShowValidation } from '../form/enum';

export interface QuickJumperProps {
  prefixCls?: string;
  disabled?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  gotoButton?: ReactNode;
}

const QuickJumper: FunctionComponent<QuickJumperProps> = function (props) {
  const { prefixCls, value, onChange, disabled, gotoButton } = props;
  const [focused, setFocused] = useState(false);
  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);
  return (
    <>
      <span className={`${prefixCls}-quick-jumper`}>
        {$l('Pagination', 'jump_to')}
      </span>
      <span className={classNames(`${prefixCls}-quick-jumper-input`, { [`${prefixCls}-quick-jumper-input-focused`]: focused })}>
        <ObserverNumberField
          value={value}
          disabled={disabled}
          min={1}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          size={Size.small}
          isFlat
          border={false}
          showValidation={ShowValidation.tooltip}
          restrict={new RegExp('[.]|^0*', 'g')}
        />
        {$l('Pagination', 'page')}
      </span>
      {gotoButton}
    </>
  );
};

QuickJumper.displayName = 'QuickJumper';

export default QuickJumper;
