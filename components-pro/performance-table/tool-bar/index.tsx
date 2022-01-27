import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import isString from 'lodash/isString';
import Tooltip from '../../tooltip';
import tableContext from '../TableContext'
import ColumnFilter from './ColumnFilter';

export type ToolBarSetting = {
  icon: React.ReactNode;
  tooltip?: string;
  key?: string;
  onClick?: (key?: string) => void;
};

type SettingPropType = React.ReactNode | ToolBarSetting;

export type ToolBarProps = {
  header?: React.ReactNode;
  toolBarRender?: (props: object) => React.ReactNode[];
  prefixCls?: string;
  className?: string;
  hideToolbar: boolean;
  style?: React.CSSProperties;
  /** 工具栏右侧操作区 */
  buttons?: React.ReactNode[];
  /** 工作栏右侧设置区 */
  settings?: SettingPropType[] | boolean;
  /** 过滤区 todo */
  // filter?: React.ReactNode;
};

/**
 * 获取配置区域 DOM Item
 *
 * @param setting 配置项
 * @param prefixCls
 */
function getSettingItem(setting: SettingPropType, prefixCls: string) {
  if (isString(setting) && setting === 'columnFilter') {
    return <ColumnFilter prefixCls={prefixCls} />;
  }
  if (React.isValidElement(setting)) {
    return setting;
  }
  if (setting) {
    const settingConfig: ToolBarSetting = setting as ToolBarSetting;
    const { icon, tooltip, onClick, key } = settingConfig;
    if (icon && tooltip) {
      return (
        <Tooltip title={tooltip}>
          <span
            key={key}
            onClick={() => {
              if (onClick) {
                onClick(key);
              }
            }}
          >
            {icon}
          </span>
        </Tooltip>
      );
    }
    return icon;
  }
  return null;
}

const ToolBar: React.FC<ToolBarProps> = ({
  header,
  hideToolbar,
  className,
  style,
  buttons = [],
  settings = [],
}) => {

  const { tableStore: { prefixCls } } = useContext(tableContext);
  const toolbarPrefixCls = `${prefixCls}-toolbar`;

  const buttonsDom = useMemo(() => {
    if (!Array.isArray(buttons)) {
      return buttons;
    }
    if (buttons.length < 1) {
      return null;
    }
    return (
      <div className={`${toolbarPrefixCls}-buttons`}>
        {buttons.map((btn, index) => {
          if (!React.isValidElement(btn)) {
            // eslint-disable-next-line react/no-array-index-key
            return <React.Fragment key={index}>{btn}</React.Fragment>;
          }
          return React.cloneElement(btn, {
            // eslint-disable-next-line react/no-array-index-key
            key: index,
            ...btn.props,
          });
        })}
      </div>
    );
  }, [buttons]);

  const headerNode = useMemo(() =>
    (
      <div className={`${toolbarPrefixCls}-header`}>
        {header}
      </div>
    ), [header]);

  const settingsDom = useMemo(() =>{
    if (!Array.isArray(settings)) {
      return settings;
    }
    if (settings.length < 1) {
      return null;
    }
    return settings.length ? (
      <div className={`${toolbarPrefixCls}-setting-items`}>
        {settings.map((setting, index) => {
          const settingItem = getSettingItem(setting, prefixCls!);
          return (
          // eslint-disable-next-line react/no-array-index-key
            <div key={index} className={`${toolbarPrefixCls}-setting-item`}>
              {settingItem}
            </div>
          );
        })}
      </div>
    ) : null;
  }, [settings]);

  // 不展示 toolbar
  if (hideToolbar) {
    return null;
  }

  return (
    <div style={style} className={classNames(`${toolbarPrefixCls}`, className)}>
      <div className={`${toolbarPrefixCls}-container`}>
        {headerNode}
        <div className={`${toolbarPrefixCls}-right`}>
          {buttonsDom}
          {settingsDom}
        </div>
      </div>
    </div>
  );
};

export default ToolBar;
