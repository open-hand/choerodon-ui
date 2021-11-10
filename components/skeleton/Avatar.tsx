import * as React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import Element, { SkeletonElementProps } from './Element';
import ConfigContext from '../config-provider/ConfigContext';

export interface AvatarProps extends Omit<SkeletonElementProps, 'shape'> {
  shape?: 'circle' | 'square';
}

const SkeletonAvatar: React.FunctionComponent<AvatarProps> = function SkeletonAvatar(props) {
  const { prefixCls: customizePrefixCls, className, active } = props;
  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
  const cls = classNames(prefixCls, className, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active,
  });
  return (
    <div className={cls}>
      <Element prefixCls={`${prefixCls}-avatar`} {...omit(props, ['prefixCls'])} />
    </div>
  );
};

SkeletonAvatar.displayName = 'SkeletonAvatar';

SkeletonAvatar.defaultProps = {
  size: 'default',
  shape: 'circle',
};

export default React.memo(SkeletonAvatar);
