import React, { FunctionComponent } from 'react';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import { observer } from 'mobx-react-lite';
import { $l } from '../locale-context';
import Button from '../button/Button';
import { ButtonColor } from '../button/enum';

export interface CountDownProps {
  onClick: () => void;
  countDown: any;
}

const CountDownButton: FunctionComponent<CountDownProps> = observer(function CountDownButton(
  props,
) {
  const prefixCls = getProPrefixCls('secret-field');
  const { onClick, countDown } = props;
  const { count } = countDown;

  return (
    <Button
      className={`${prefixCls}-modal-verify-btn`}
      color={ButtonColor.primary}
      disabled={count > 0}
      onClick={onClick}
    >
      {count > 0 ? `${count}s` : $l('SecretField', 'get_verify_code')}
    </Button>
  );
});

CountDownButton.displayName = 'CountDownButton';

export default CountDownButton;
