import React, { Component, CSSProperties } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from '../icon';
import { Circle } from '../rc-components/progress';
import Loading from './Loading';
import { Size } from '../_util/enum';
import { ProgressPosition, ProgressStatus, ProgressType } from './enum';
import { getPrefixCls } from '../configure';

export interface ProgressProps {
  prefixCls?: string;
  className?: string;
  type?: ProgressType;
  percent?: number;
  successPercent?: number;
  format?: (percent: number) => string;
  status?: ProgressStatus;
  showInfo?: boolean;
  strokeWidth?: number;
  trailColor?: string;
  strokeColor?: string;
  width?: number;
  style?: CSSProperties;
  gapDegree?: number;
  gapPosition?: ProgressPosition;
  size?: Size;
}

export default class Progress extends Component<ProgressProps, {}> {
  static displayName = 'Progress';

  static Line: any;

  static Circle: any;

  static Loading: any;

  static defaultProps = {
    type: ProgressType.line,
    percent: 0,
    showInfo: true,
    trailColor: '#f3f3f3',
    size: Size.default,
  };

  static propTypes = {
    status: PropTypes.oneOf([
      ProgressStatus.normal,
      ProgressStatus.exception,
      ProgressStatus.active,
      ProgressStatus.success,
    ]),
    type: PropTypes.oneOf([
      ProgressType.line,
      ProgressType.circle,
      ProgressType.dashboard,
      ProgressType.loading,
    ]),
    showInfo: PropTypes.bool,
    percent: PropTypes.number,
    width: PropTypes.number,
    strokeWidth: PropTypes.number,
    strokeColor: PropTypes.string,
    trailColor: PropTypes.string,
    format: PropTypes.func,
    gapDegree: PropTypes.number,
    size: PropTypes.oneOf([Size.default, Size.small, Size.large]),
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
      ...restProps
    } = props;
    const prefixCls = getPrefixCls('progress', customizePrefixCls);
    const progressStatus =
      parseInt(successPercent ? successPercent.toString() : percent.toString(), 10) >= 100 &&
      !('status' in props)
        ? ProgressStatus.success
        : status || ProgressStatus.normal;
    let progressInfo;
    let progress;
    const textFormatter = format || (percentNumber => `${percentNumber}%`);

    if (showInfo) {
      let text;
      const circleType = type === ProgressType.circle || type === ProgressType.dashboard;
      if (progressStatus === ProgressStatus.exception) {
        text = format ? textFormatter(percent) : <Icon type={circleType ? 'close' : 'cancel'} />;
      } else if (progressStatus === ProgressStatus.success) {
        text = format ? (
          textFormatter(percent)
        ) : (
          <Icon type={circleType ? 'check' : 'check_circle'} />
        );
      } else {
        text = textFormatter(percent);
      }
      progressInfo = <span className={`${prefixCls}-text`}>{text}</span>;
    }

    if (type === ProgressType.line) {
      const percentStyle = {
        width: `${percent}%`,
        height: strokeWidth || (size === Size.small ? 6 : 8),
        background: strokeColor,
      };
      const successPercentStyle = {
        width: `${successPercent}%`,
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
            percent={percent}
            strokeWidth={circleWidth}
            trailWidth={circleWidth}
            trailColor={trailColor}
            strokeColor={strokeColor}
            prefixCls={prefixCls}
            gapDegree={gapDeg}
            gapPosition={gapPos}
          />
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
