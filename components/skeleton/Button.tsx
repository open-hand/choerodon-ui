import * as React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import Element, { SkeletonElementProps } from './Element';
import ConfigContext from '../config-provider/ConfigContext';

export interface SkeletonButtonProps extends Omit<SkeletonElementProps, 'size'> {
  size?: 'large' | 'small' | 'default';
}

const SkeletonButton: React.FunctionComponent<SkeletonButtonProps> = function SkeletonButton(props) {
  const { prefixCls: customizePrefixCls, className, active } = props;
  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
  const cls = classNames(prefixCls, className, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active,
  });
  return (
    <div className={cls}>
      <Element prefixCls={`${prefixCls}-button`} {...omit(props, ['prefixCls'])} />
    </div>
  );
};

SkeletonButton.displayName = 'SkeletonButton';

SkeletonButton.defaultProps = {
  size: 'default',
};

export default React.memo(SkeletonButton);
