import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { CheckBox, CheckBoxProps } from '../check-box/CheckBox';
import autobind from '../_util/autobind';

@observer
export default class Switch extends CheckBox<CheckBoxProps> {
  static displayName = 'Switch';

  /**
   * tooltip disable sign
   */
  // eslint-disable-next-line camelcase
  static __Pro_SWITCH = true;

  static defaultProps = {
    ...CheckBox.defaultProps,
    suffixCls: 'switch',
  };

  @autobind
  handleKeyDown(e) {
    if (e.keyCode === KeyCode.LEFT) {
      this.setChecked(false);
    } else if (e.keyCode === KeyCode.RIGHT) {
      this.setChecked(true);
    }
    super.handleKeyDown(e);
  }

  getTextNode() {
    const {
      prefixCls,
      props: { children, unCheckedChildren },
    } = this;
    const text = this.isChecked() ? children : unCheckedChildren || children;
    return <span className={`${prefixCls}-label`}>{text}</span>;
  }

  renderSwitchFloatLabel() {
    const {
      prefixCls,
    } = this;
    return (
      <span className={`${prefixCls}-float-label`}>
        {this.getLabelChildren()}
      </span>
    )
  }

  renderInner(): ReactNode {
    return undefined;
  }
}
