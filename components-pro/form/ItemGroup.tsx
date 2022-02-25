import React, {
  ReactNode,
  CSSProperties,
  FC,
  useContext,
  Children,
  isValidElement,
} from 'react';
import classNames from 'classnames';
import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import omit from 'lodash/omit';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import isFragment from '../_util/isFragment';
import { ShowHelp } from '../field/enum';

export interface ItemGroupProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  label?: string | ReactNode;
  help?: string;
  showHelp?: ShowHelp.label;
  required?: boolean;
  useColon?: boolean;
  compact?: boolean;
}

const ItemGroup: FC<ItemGroupProps> = props => {
  const {
    className,
    children,
    compact,
    ...oterProps
  } = props;
  const { getProPrefixCls } = useContext(ConfigContext);
  const prefixCls = getProPrefixCls('form-item-group');
  const cls = classNames(className, prefixCls, {
    [`${prefixCls}-compact`]: compact,
  });

  const mapChildren = (child: ReactNode): ReactNode => {
    if (!isValidElement(child)) {
      return undefined;
    }
    if (isFragment(child) && child.props) {
      return Children.map<ReactNode, ReactNode>(child.props.children, innerChild => mapChildren(innerChild));
    }

    let itemStyle: CSSProperties = {};
    if (child.props && child.props.style && (child.props.style.originalWidth || child.props.style.width)) {
      if (child.props.style.width !== '100%') {
        itemStyle = {
          width: child.props.style.width,
        };
        child.props.style.originalWidth = child.props.style.width;
      }
      itemStyle = {
        width: child.props.style.originalWidth || child.props.style.width,
      };
      child.props.style.width = '100%';
    }

    if ((isFunction(child.type) || typeof child.type === 'object') && (child.type as any).displayName === 'FormItem') {
      return mapChildren(child.props.children);
    }
    return (
      <span className={`${prefixCls}-item`} style={{ ...itemStyle }}>
        {child}
      </span>
    );
  }
  const childs = Children.map<ReactNode, ReactNode>(children, child => mapChildren(child));
  if (isNil(childs)) {
    return null;
  }

  const passProps = omit(oterProps, [
    'label',
    'help',
    'showHelp',
    'required',
    'useColon',
  ]);

  return (
    <span
      className={cls}
      {...passProps}
    >
      {childs}
    </span>
  );
}

ItemGroup.displayName = 'ItemGroup';

ItemGroup.defaultProps = {
  showHelp: ShowHelp.label,
};

export default ItemGroup;
