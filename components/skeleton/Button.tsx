import * as React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import Element, { SkeletonElementProps } from './Element';
import { getPrefixCls } from '../configure';

export interface SkeletonButtonProps extends Omit<SkeletonElementProps, 'size'> {
  size?: 'large' | 'small' | 'default';
}

// eslint-disable-next-line react/prefer-stateless-function
class SkeletonButton extends React.Component<SkeletonButtonProps, any> {
  static defaultProps: Partial<SkeletonButtonProps> = {
    size: 'default',
  };

  renderSkeletonButton = () => {
    const { prefixCls: customizePrefixCls, className, active } = this.props;
    const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
    const otherProps = omit(this.props, ['prefixCls']);
    const cls = classNames(prefixCls, className, `${prefixCls}-element`, {
      [`${prefixCls}-active`]: active,
    });
    return (
      <div className={cls}>
        <Element prefixCls={`${prefixCls}-button`} {...otherProps} />
      </div>
    );
  };

  render() {
    return <>{this.renderSkeletonButton()}</>;
  }
}

export default SkeletonButton;
