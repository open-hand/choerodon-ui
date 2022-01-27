import React, { useContext } from 'react';
import classnames from 'classnames';
import isObject from 'lodash/isObject';
import Icon from '../icon';
import NotFound from './noFound';
import ServerError from './serverError';
import Nnauthorized from './unauthorized';
import warning from '../_util/warning';
import ConfigContext from '../config-provider/ConfigContext';

export type ResultStatusType = 403 | 404 | 500 | '403' | '404' | '500' | 'success' | 'error' | 'info' | 'warning' | string;

export type StatusRenderer = object

export interface ResultProps {
  icon?: React.ReactNode;
  status?: ResultStatusType;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  statusRenderer?: StatusRenderer;
}

const renderStatus = (prefixCls: string, { status, icon, statusRenderer }: ResultProps, resultStatusRenderer?: object) => {
  const className = classnames(`${prefixCls}-icon`);
  warning(
    !(typeof icon === 'string' && icon.length > 2),
    `\`icon\` is using ReactNode instead of string naming . Please check \`${icon}\` at https://choerodon.github.io/choerodon-ui/zh/cmp/general/icon`,
  );

  // 初始化map
  const iconMap = new Map<string, React.ReactNode>(
    [
      ['403', <Nnauthorized key="403" />],
      ['404', <NotFound key="404" />],
      ['500', <ServerError key="500" />],
      ['success', <Icon key="success" type="check_circle" />],
      ['error', <Icon key="error" type="error" />],
      ['info', <Icon key="info" type="info" />],
      ['warning', <Icon key="warning" type="warning" />],
    ],
  );

  // 注入全局的config
  const statusRendererAll = { ...resultStatusRenderer, ...statusRenderer };

  if (isObject(statusRendererAll)) {
    if (Object.keys(statusRendererAll).length > 0) {
      Object.keys(statusRendererAll).forEach((item) => {
        iconMap.set(item, statusRendererAll[item]);
      });
    }
  }
  const statusIcon = iconMap.get(String(status));
  if (statusIcon && (statusIcon as any).type !== Icon) {
    return (
      <div
        className={`${className} ${prefixCls}-image`}
        style={icon || statusRenderer ? {} : (`${status}` === '500' ? { width: 400 } : { width: 800 })}
      >
        {icon || statusIcon}
      </div>
    );
  }
  return (
    <div className={`${className}`}>
      {icon || statusIcon}
    </div>
  );

};

const renderExtra = (prefixCls: string, { extra }: ResultProps) =>
  extra && <div className={`${prefixCls}-extra`}>{extra}</div>;

const Result = (props: ResultProps) => {
  const {
    prefixCls: customizePrefixCls,
    className: customizeClassName,
    subTitle,
    title,
    style,
    children,
    status,
  } = props;
  const { getPrefixCls, getConfig } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('result', customizePrefixCls);
  const className = classnames(prefixCls, `${prefixCls}-${status}`, customizeClassName);
  return (
    <div className={className} style={style}>
      {renderStatus(prefixCls, props, getConfig('resultStatusRenderer'))}
      <div className={`${prefixCls}-title`}>{title}</div>
      {subTitle && <div className={`${prefixCls}-subtitle`}>{subTitle}</div>}
      {children && <div className={`${prefixCls}-content`}>{children}</div>}
      {renderExtra(prefixCls, props)}
    </div>
  );
};

Result.defaultProps = {
  status: 'info',
};

export default Result;
