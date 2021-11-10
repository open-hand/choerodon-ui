import * as React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import Element, { SkeletonElementProps } from './Element';
import ConfigContext from '../config-provider/ConfigContext';

export interface SkeletonInputProps extends Omit<SkeletonElementProps, 'size' | 'shape'> {
  size?: 'large' | 'small' | 'default';
}

const SkeletonInput: React.FunctionComponent<SkeletonInputProps> = function SkeletonInput(props) {
  const { prefixCls: customizePrefixCls, className, active } = props;
  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
  const cls = classNames(prefixCls, className, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active,
  });
  return (
    <div className={cls}>
      <Element prefixCls={`${prefixCls}-input`} {...omit(props, ['prefixCls'])} />
    </div>
  );
};

SkeletonInput.displayName = 'SkeletonInput';

SkeletonInput.defaultProps = {
  size: 'default',
};

export default React.memo(SkeletonInput);
