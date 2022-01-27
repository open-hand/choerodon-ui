import React, { CSSProperties, FunctionComponent, useContext } from 'react';
import RcSteps, { Step, StepGroup } from '../rc-components/steps';
import { Size } from '../_util/enum';
import ConfigContext from '../config-provider/ConfigContext';

export interface StepsProps {
  prefixCls?: string;
  iconPrefix?: string;
  current?: number;
  status?: 'wait' | 'process' | 'finish' | 'error';
  size?: Size;
  direction?: 'horizontal' | 'vertical';
  progressDot?: boolean | Function;
  style?: CSSProperties;
  headerRender?: () => React.ReactElement<any>;
  headerIcon?: string;
  headerText?: string;
  type?: string;
  onChange?: Function
}

export interface StepProps {
  className?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  style?: React.CSSProperties;
}

export interface StepsComponent extends FunctionComponent<StepsProps> {
  Step: React.ClassicComponentClass<StepProps>;
  StepGroup: React.ClassicComponentClass<StepProps>;
}

const Steps = function Steps(props) {
  const { prefixCls: customizePrefixCls } = props;
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('steps', customizePrefixCls);
  return <RcSteps {...props} prefixCls={prefixCls} />;
} as StepsComponent;

Steps.displayName = 'Steps';

Steps.Step = Step as React.ClassicComponentClass<StepProps>;

Steps.StepGroup = StepGroup as React.ClassicComponentClass<StepProps>;

Steps.defaultProps = {
  iconPrefix: 'icon',
  current: 0,
};

export default Steps;
