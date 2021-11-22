import React, { FunctionComponent, useContext } from 'react';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { observer } from 'mobx-react-lite';
import { $l } from '../locale-context';
import Button from '../button/Button';
import { ButtonColor } from '../button/enum';

export interface CountDownProps {
  onClick: () => void;
  countDown: any;
  verifyNumber: any
}

const CountDownButton: FunctionComponent<CountDownProps> = function CountDownButton(
  props,
) {
  const { getProPrefixCls } = useContext(ConfigContext)
  const prefixCls = getProPrefixCls('secret-field');
  const { onClick, countDown, verifyNumber } = props;
  const { count } = countDown;
  return (
    <Button
      className={`${prefixCls}-modal-verify-btn`}
      color={ButtonColor.primary}
      disabled={count > 0 || !verifyNumber}
      onClick={onClick}
    >
      {count > 0 ? `${count}s` : $l('SecretField', 'get_verify_code')}
    </Button>
  );
};

CountDownButton.displayName = 'CountDownButton';

export default observer(CountDownButton);
