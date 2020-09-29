import React, { useEffect, useRef, useReducer } from 'react';
import Statistic, { StatisticProps } from './Statistic';
import { formatCountdown, countdownValueType, FormatConfig } from './utils';
import { cloneElement } from '../_util/reactNode';

const REFRESH_INTERVAL = 1000 / 30;

interface CountdownProps extends StatisticProps {
  value?: countdownValueType;
  format?: string;
  onFinish?: () => void;
}

function getTime(value?: countdownValueType) {
  return new Date(value as any).getTime();
}

const Countdown: React.FC<CountdownProps> = (props) => {
  const { value, format, onFinish } = props;
  // 强制渲染界面
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const timeStamp = getTime(value);
  const countdownRef = useRef<() => void>();
  const idRef = useRef<NodeJS.Timeout | null>();

  // 触发渲染界面，如果达到目标位置不执行
  countdownRef.current = () => {
    forceUpdate();
    if (timeStamp <= Date.now()) {
      clearInterval(Number(idRef.current))
      if (onFinish && timeStamp < Date.now()) {
        onFinish();
      }
    }
  };

  // 启动计时器
  useEffect(() => {
    if (timeStamp >= Date.now()) {
      if (!idRef.current) {
        idRef.current = setInterval(() => {
          (countdownRef as any).current();
        }, REFRESH_INTERVAL);
      }
    } else {
      clearInterval(Number(idRef.current))
    }
    return () => clearInterval(Number(idRef.current));
  }, [format, value]);

  // Countdown do not need display the timeStamp
  const valueRender = (node: React.ReactElement<HTMLDivElement>) =>
    cloneElement(node, {
      title: undefined,
    });

  return (
    <Statistic valueRender={valueRender} {...props} formatter={(valueFormatter: countdownValueType, config: FormatConfig) => formatCountdown(valueFormatter, { ...config, format })} />
  );
}

Countdown.defaultProps = {
  format: 'HH:mm:ss',
};

export default Countdown;
