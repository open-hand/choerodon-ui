import React, { Component, CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
import Icon from '../icon';
import { Circle } from '../rc-components/progress';
import Loading from './Loading';
import { Size } from '../_util/enum';
import { ProgressPosition, ProgressStatus, ProgressType } from './enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface ProgressProps {
  prefixCls?: string;
  className?: string;
  type?: ProgressType;
  percent?: number;
  successPercent?: number;
  format?: (percent?: number, successPercent?: number) => ReactNode;
  status?: ProgressStatus;
  showInfo?: boolean;
  showPointer?: boolean;
  strokeWidth?: number;
  trailColor?: string;
  strokeColor?: string;
  width?: number;
  style?: CSSProperties;
  gapDegree?: number;
  gapPosition?: ProgressPosition;
  size?: Size;
}

const validProgress = (progress: number | undefined) => {
  if (!progress || progress < 0) {
    return 0;
  }
  if (progress > 100) {
    return 100;
  }
  return progress;
};

export default class Progress extends Component<ProgressProps, {}> {
  static displayName = 'Progress';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static Line: any;

  static Circle: any;

  static Loading: any;

  static defaultProps = {
    type: ProgressType.line,
    percent: 0,
    showInfo: true,
    showPointer: false,
    trailColor: '#f3f3f3',
    size: Size.default,
  };

  context: ConfigContextValue;

  renderPointer = () => {
    const props = this.props;
    const {
      prefixCls: customizePrefixCls,
      // strokeColor,
      percent = 0,
      status,
      successPercent,
    } = props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('progress', customizePrefixCls);
    const progressStatus =
      parseInt(successPercent ? successPercent.toString() : percent.toString(), 10) >= 100 &&
      !('status' in props)
        ? ProgressStatus.success
        : status || ProgressStatus.normal;
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="32" viewBox="0 0 38 32">
        <path
          // style={{
          //   fill: strokeColor ? strokeColor : '',
          // }}
          className={`${prefixCls}-status-pointer-${progressStatus}`}
          fill="#6887E8"
          d="M103.371587,49.724578 C103.681687,50.1292204 103.634794,50.6951896 103.280961,51.0440945 L103.186137,51.1265795 L78.8502947,69.7769214 C79.5504585,70.8623565 79.9567807,72.1551739 79.9567807,73.5428929 C79.9567807,77.3850168 76.8421239,80.4996736 73,80.4996736 C69.1578761,80.4996736 66.0432193,77.3850168 66.0432193,73.5428929 C66.0432193,69.700769 69.1578761,66.5861122 73,66.5861122 C74.7317808,66.5861122 76.3157678,67.218893 77.5333601,68.265854 L101.969586,49.5391281 C102.407948,49.2031866 103.035646,49.2862154 103.371587,49.724578 Z M73,68.5861122 C70.2624456,68.5861122 68.0432193,70.8053385 68.0432193,73.5428929 C68.0432193,76.2804473 70.2624456,78.4996736 73,78.4996736 C75.7375544,78.4996736 77.9567807,76.2804473 77.9567807,73.5428929 C77.9567807,70.8053385 75.7375544,68.5861122 73,68.5861122 Z"
          transform="translate(-66 -49)"
        />
      </svg>
    );
  };

  /**
   * 计算指针角度
   */
  getPointerDeg = () => {
    const {
      percent = 0,
      gapDegree = 0,
    } = this.props;
    // 缺口角度
    const gapDeg = gapDegree || 75;
    // percent 角度
    const percentDeg = (360 - gapDeg) * (percent / 100);
    // 初始位置 0 -> 126 + 缺口角度/2 + percent 角度 + diffDeg
    let diffDeg = 0;
    if (percent <= 75 && percent > 50) {
      diffDeg = -3;
    } else if (percent > 75) {
      diffDeg = -5;
    } else if (percent < 50) {
      diffDeg = 5;
    }
    const deg = 128 + gapDeg / 2 + percentDeg + diffDeg;
    return { transform: `rotate(${deg}deg)` };
  };

  render() {
    const props = this.props;
    const {
      prefixCls: customizePrefixCls,
      className,
      percent = 0,
      status,
      format,
      trailColor,
      size,
      successPercent,
      type,
      strokeWidth,
      strokeColor,
      width,
      showInfo,
      gapDegree = 0,
      gapPosition,
      showPointer,
      ...restProps
    } = props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('progress', customizePrefixCls);
    const progressStatus =
      parseInt(successPercent ? successPercent.toString() : percent.toString(), 10) >= 100 &&
      !('status' in props)
        ? ProgressStatus.success
        : status || ProgressStatus.normal;
    let progressInfo;
    let progressCenter;
    let progress;
    const textFormatter = format || (percentNumber => `${percentNumber}%`);

    if (showInfo) {
      let text;
      const circleType = type === ProgressType.circle || type === ProgressType.dashboard;
      if (format || (progressStatus !== ProgressStatus.exception && progressStatus !== ProgressStatus.success)) {
        text = textFormatter(validProgress(percent), validProgress(successPercent));
      } else if (progressStatus === ProgressStatus.exception) {
        text = <Icon type={circleType ? 'close' : 'cancel'} />;
      } else if (progressStatus === ProgressStatus.success) {
        text = <Icon type={circleType ? 'check' : 'check_circle'} />;
      }
      progressInfo = <span className={`${prefixCls}-text`}>{text}</span>;
      if (showPointer) {
        progressCenter = (
          <div className={`${prefixCls}-pointer`} style={this.getPointerDeg()}>
            {this.renderPointer()}
          </div>
        );
        progressInfo = <span className={`${prefixCls}-text-bottom`}>{text}</span>;
      }
    }

    if (type === ProgressType.line) {
      const percentStyle = {
        width: `${validProgress(percent)}%`,
        height: strokeWidth || (size === Size.small ? 6 : 8),
        background: strokeColor,
      };
      const successPercentStyle = {
        width: `${validProgress(successPercent)}%`,
        height: strokeWidth || (size === Size.small ? 6 : 8),
      };
      const successSegment =
        successPercent !== undefined ? (
          <div className={`${prefixCls}-success-bg`} style={successPercentStyle} />
        ) : null;
      progress = (
        <div>
          <div className={`${prefixCls}-outer`}>
            <div className={`${prefixCls}-inner`}>
              <div className={`${prefixCls}-bg`} style={percentStyle} />
              {successSegment}
            </div>
          </div>
          {progressInfo}
        </div>
      );
    } else if (type === ProgressType.circle || type === ProgressType.dashboard) {
      const circleSize = width || 120;
      const circleStyle = {
        width: circleSize,
        height: circleSize,
        fontSize: circleSize * 0.15 + 6,
      };
      const circleWidth = strokeWidth || 6;
      const gapPos =
        gapPosition ||
        (type === ProgressType.dashboard && ProgressPosition.bottom) ||
        ProgressPosition.top;
      const gapDeg = gapDegree || (type === ProgressType.dashboard && 75);
      progress = (
        <div className={`${prefixCls}-inner`} style={circleStyle}>
          <Circle
            percent={validProgress(percent)}
            strokeWidth={circleWidth}
            trailWidth={circleWidth}
            trailColor={trailColor}
            strokeColor={strokeColor}
            prefixCls={prefixCls}
            gapDegree={gapDeg}
            gapPosition={gapPos}
          />
          {progressCenter}
          {progressInfo}
        </div>
      );
    } else if (type === ProgressType.loading) {
      progress = (
        <div className={`${prefixCls}-inner`}>
          <Loading />
        </div>
      );
    }

    const classString = classNames(
      prefixCls,
      {
        [`${prefixCls}-${(type === ProgressType.dashboard && ProgressType.circle) || type}`]: true,
        [`${prefixCls}-status-${progressStatus}`]: true,
        [`${prefixCls}-show-info`]: showInfo,
        [`${prefixCls}-${size}`]: size,
      },
      className,
    );

    return (
      <div {...restProps} className={classString}>
        {progress}
      </div>
    );
  }
}
