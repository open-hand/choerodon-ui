import * as React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import Element, { SkeletonElementProps } from './Element';
import { getPrefixCls } from '../configure';

export interface SkeletonInputProps extends Omit<SkeletonElementProps, 'size' | 'shape'> {
  size?: 'large' | 'small' | 'default';
}

// eslint-disable-next-line react/prefer-stateless-function
class SkeletonInput extends React.Component<SkeletonInputProps, any> {
  static defaultProps: Partial<SkeletonInputProps> = {
    size: 'default',
  };

  renderSkeletonInput = () => {
    const { prefixCls: customizePrefixCls, className, active } = this.props;
    const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
    const otherProps = omit(this.props, ['prefixCls']);
    const cls = classNames(prefixCls, className, `${prefixCls}-element`, {
      [`${prefixCls}-active`]: active,
    });
    return (
      <div className={cls}>
        <Element prefixCls={`${prefixCls}-input`} {...otherProps} />
      </div>
    );
  };

  render() {
    return <>{this.renderSkeletonInput()}</>;
  }
}

export default SkeletonInput;
