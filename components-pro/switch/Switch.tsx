import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import defer from 'lodash/defer';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import { CheckBox, CheckBoxProps } from '../check-box/CheckBox';
import Progress from '../progress';
import { Size } from '../core/enum';
import autobind from '../_util/autobind';
import isOverflow from '../overflow-tip/util';
import { show } from '../tooltip/singleton';
import { ShowHelp } from '../field/enum';

interface SwitchProps extends CheckBoxProps {
  /**
   * 加载中
   */
  loading?: boolean;
}
@observer
export default class Switch extends CheckBox<SwitchProps> {
  static displayName = 'Switch';

  /**
   * tooltip disable sign
   */
  // eslint-disable-next-line camelcase
  static __PRO_SWITCH = true;

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

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

  showTooltip(e): boolean{
    const { currentTarget } = e;
    const {
      props: { children, unCheckedChildren },
    } = this;
    const switchLabel = currentTarget.nextElementSibling;
    const text = this.isChecked() ? children : unCheckedChildren || children;
    if (text && isOverflow(switchLabel, 0.1)) {
      show(currentTarget, {
        title: text,
      })
      return true;
    }
    return false;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'loading',
    ]);
  }

  isDisabled(): boolean {
    if (super.isDisabled()) {
      return true;
    }
    const { loading = false } = this.props;
    return loading;
  }

  getLabelText() {
    return undefined;
  }

  getTextNode() {
    const {
      prefixCls,
      props: { children, unCheckedChildren },
    } = this;
    const text = this.isChecked() ? children : unCheckedChildren || children;
    return (
      <span className={`${prefixCls}-label`}>
        {text ? <span className={`${prefixCls}-label-content`}>{text}</span> : null}
      </span>
    );
  }

  renderSwitchFloatLabel() {
    const {
      prefixCls,
      showHelp,
      context: { getConfig },
    } = this;
    const isLabelShowHelp = showHelp === ShowHelp.label;
    return (
      <span className={classNames(
        `${prefixCls}-float-label`,
        `${getConfig('proPrefixCls')}-field-label`,
        { [`${getConfig('proPrefixCls')}-field-label-help`]: isLabelShowHelp },
        { [`${prefixCls}-label-help`]: isLabelShowHelp },
      )}>
        {this.getLabelChildren()}
        {isLabelShowHelp ? this.renderTooltipHelp() : null}
      </span>
    );
  }

  getWrapperClassNames() {
    const {
      prefixCls,
      props: {
        loading,
      },
    } = this;
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-loading`]: loading,
      },
    );
  }

  afterSetValue() {
    super.afterSetValue();
    if (this.tooltipShown && this.element) {
      defer(() => {
        if (this.tooltipShown && this.element) {
          this.showTooltip({ currentTarget: this.element });
        }
      });
    }
  }

  renderInner(): ReactNode {
    const { loading } = this.props;
    if (loading) {
      return (
        <Progress
          key="loading"
          type={ProgressType.loading}
          size={Size.small}
        />
      );
    }
    return null;
  }
}
