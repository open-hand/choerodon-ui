import React, { forwardRef, ForwardRefExoticComponent, PropsWithoutRef, ReactNode, RefAttributes, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import { composeRef } from 'rc-util/lib/ref';
import Icon from 'choerodon-ui/lib/icon';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import Tooltip from '../../tooltip';
import TransButton from '../../_util/TransButton';
import EllipsisTooltip from './EllipsisTooltip';
import Ellipsis from './Ellipsis';
import useMergedConfig from '../hooks/useMergedConfig';
import Typography, { TypographyProps } from '../Typography';
import { $l } from '../../locale-context';
import { isStyleSupport } from '../../_util/styleChecker';

export type BaseType = 'secondary' | 'success' | 'warning' | 'danger';

export interface CopyConfig {
  text?: string;
  onCopy?: () => void;
  icon?: ReactNode;
  tooltips?: boolean | ReactNode;
}

export interface EllipsisConfig {
  rows?: number;
  expandable?: boolean;
  suffix?: string;
  symbol?: ReactNode;
  onExpand?: React.MouseEventHandler<HTMLElement>;
  onEllipsis?: (ellipsis: boolean) => void;
  tooltip?: ReactNode;
}

export interface BlockProps extends TypographyProps {
  copyable?: boolean | CopyConfig;
  type?: BaseType;
  disabled?: boolean;
  ellipsis?: boolean | EllipsisConfig;
  component?: string;
  code?: boolean;
  mark?: boolean;
  underline?: boolean;
  delete?: boolean;
  strong?: boolean;
  keyboard?: boolean;
  italic?: boolean;
}

export interface BaseBlockProps extends BlockProps {
  title?: string | ReactNode;
}

function wrapperDecorations(
  { mark, code, underline, delete: del, strong, keyboard, italic }: BlockProps,
  content: ReactNode,
) {
  let currentContent = content;

  function wrap(needed: boolean | undefined, tag: string) {
    if (!needed) return;

    currentContent = React.createElement(tag, {}, currentContent);
  }

  wrap(strong, 'strong');
  wrap(underline, 'u');
  wrap(del, 'del');
  wrap(code, 'code');
  wrap(mark, 'mark');
  wrap(keyboard, 'kbd');
  wrap(italic, 'i');

  return currentContent;
}

function getNode(dom: ReactNode, defaultNode: ReactNode, needDom?: boolean) {
  if (dom === true || dom === undefined) {
    return defaultNode;
  }
  return dom || (needDom && defaultNode);
}

function toList<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

export interface IBase extends ForwardRefExoticComponent<PropsWithoutRef<BaseBlockProps> & RefAttributes<HTMLDivElement>> {
  _PRO_TYPOGRAPHY_BASE?: boolean;
}

const ELLIPSIS_STR = '...';

const Base: IBase = forwardRef<HTMLDivElement, BaseBlockProps>((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    style,
    type,
    disabled,
    children,
    ellipsis,
    copyable,
    component,
    title,
    suffixCls,
    ...restProps
  } = props;
  const { getProPrefixCls } = useContext(ConfigContext);

  const typographyRef = useRef<HTMLElement>(null);

  // ============================ MISC ============================
  const prefixCls = getProPrefixCls('typography', customizePrefixCls);

  const textProps = omit(restProps, [
    'mark',
    'code',
    'delete',
    'underline',
    'strong',
    'keyboard',
    'italic',
    'dataSet',
    'rowIndex',
    'colIndex',
    'suffixCls',
  ]) as any;

  // ========================== Copyable ==========================
  const [enableCopy, copyConfig] = useMergedConfig<CopyConfig>(copyable);
  const [copied, setCopied] = useState(false);
  const copyIdRef = useRef<NodeJS.Timeout>();

  const cleanCopyId = () => {
    clearTimeout(copyIdRef.current!);
  };

  const onCopyClick = (e?: React.MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    copy(copyConfig.text || String(children) || '');

    setCopied(true);

    // Trigger tips update
    cleanCopyId();
    copyIdRef.current = setTimeout(() => {
      setCopied(false);
    }, 3000);

    if (copyConfig.onCopy) {
      copyConfig.onCopy();
    }
  };

  useEffect(() => cleanCopyId, []);

  // ========================== Ellipsis ==========================
  const [isLineClampSupport, setIsLineClampSupport] = useState(false);
  const [isTextOverflowSupport, setIsTextOverflowSupport] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [isJsEllipsis, setIsJsEllipsis] = useState(false);
  const [isNativeEllipsis, setIsNativeEllipsis] = useState(false);
  const [enableEllipsis, ellipsisConfig] = useMergedConfig<EllipsisConfig>(ellipsis, {
    expandable: false,
  });

  const mergedEnableEllipsis = enableEllipsis && !expanded;

  const { rows = 1 } = ellipsisConfig;

  const needMeasureEllipsis = useMemo(
    () =>
      !mergedEnableEllipsis ||
      ellipsisConfig.suffix !== undefined ||
      ellipsisConfig.onEllipsis ||
      ellipsisConfig.expandable ||
      enableCopy,
    [mergedEnableEllipsis, ellipsisConfig, enableCopy],
  );

  useLayoutEffect(() => {
    if (enableEllipsis && !needMeasureEllipsis) {
      setIsLineClampSupport(isStyleSupport('webkitLineClamp'));
      setIsTextOverflowSupport(isStyleSupport('textOverflow'));
    }
  }, [needMeasureEllipsis, enableEllipsis]);

  const cssEllipsis = useMemo(() => {
    if (needMeasureEllipsis) {
      return false;
    }

    if (rows === 1) {
      return isTextOverflowSupport;
    }

    return isLineClampSupport;
  }, [needMeasureEllipsis, isTextOverflowSupport, isLineClampSupport]);

  const isMergedEllipsis = mergedEnableEllipsis && (cssEllipsis ? isNativeEllipsis : isJsEllipsis);

  const cssTextOverflow = mergedEnableEllipsis && rows === 1 && cssEllipsis;
  const cssLineClamp = mergedEnableEllipsis && rows > 1 && cssEllipsis;

  // >>>>> Expand
  const onExpandClick: React.MouseEventHandler<HTMLElement> = e => {
    setExpanded(true);
    if (ellipsisConfig.onExpand) {
      ellipsisConfig.onExpand(e);
    }
  };

  const [ellipsisWidth, setEllipsisWidth] = useState(0);
  const onResize = (width: number) => {
    setEllipsisWidth(width);
  };

  const onJsEllipsis = (jsEllipsis: boolean) => {
    setIsJsEllipsis(jsEllipsis);

    if (isJsEllipsis !== jsEllipsis && ellipsisConfig.onEllipsis) {
      ellipsisConfig.onEllipsis(jsEllipsis);
    }
  };

  useEffect(() => {
    const textEle = typographyRef.current;

    if (enableEllipsis && cssEllipsis && textEle) {
      const currentEllipsis = cssLineClamp
        ? textEle.offsetHeight < textEle.scrollHeight
        : textEle.offsetWidth < textEle.scrollWidth;
      if (isNativeEllipsis !== currentEllipsis) {
        setIsNativeEllipsis(currentEllipsis);
      }
    }
  }, [enableEllipsis, cssEllipsis, children, cssLineClamp]);

  // ========================== Tooltip ===========================
  const tooltipTitle = ellipsisConfig.tooltip === true ? children : ellipsisConfig.tooltip;
  const topAriaLabel = useMemo(() => {
    const isValid = (val: any) => ['string', 'number'].includes(typeof val);

    if (!enableEllipsis || cssEllipsis) {
      return undefined;
    }

    if (isValid(children)) {
      return children;
    }

    if (isValid(title)) {
      return title;
    }

    if (isValid(tooltipTitle)) {
      return tooltipTitle;
    }

    return undefined;
  }, [enableEllipsis, cssEllipsis, title, tooltipTitle, isMergedEllipsis]);

  // =========================== Render ===========================
  // >>>>>>>>>>> Typography
  // Expand
  const renderExpand = () => {
    const { expandable, symbol } = ellipsisConfig;

    if (!expandable) return null;

    let expandContent: ReactNode;
    if (symbol) {
      expandContent = symbol;
    } else {
      expandContent = $l('Typography', 'expand');
    }

    return (
      <a
        key="expand"
        className={`${prefixCls}-expand`}
        onClick={onExpandClick}
        aria-label={$l('Typography', 'expand')}
      >
        {expandContent}
      </a>
    );
  };

  // Copy
  const renderCopy = () => {
    if (!enableCopy) return;

    const { tooltips, icon } = copyConfig;

    const tooltipNodes = toList(tooltips);
    const iconNodes = toList(icon);

    const copyTitle = copied
      ? getNode(tooltipNodes[1], $l('Typography', 'copied'))
      : getNode(tooltipNodes[0], $l('Typography', 'copy'));
    const systemStr = copied ? $l('Typography', 'copied') : $l('Typography', 'copy');
    const ariaLabel = typeof copyTitle === 'string' ? copyTitle : systemStr;

    return (
      <Tooltip key="copy" title={copyTitle}>
        <TransButton
          className={classNames(`${prefixCls}-copy`, copied && `${prefixCls}-copy-success`)}
          onClick={onCopyClick}
          aria-label={ariaLabel}
        >
          {copied
            ? getNode(iconNodes[1], <Icon type="check" />, true)
            : getNode(iconNodes[0], <Icon type="content_copy" />, true)}
        </TransButton>
      </Tooltip>
    );
  };

  const renderOperations = (renderExpanded: boolean) => [
    renderExpanded && renderExpand(),
    renderCopy(),
  ];

  const renderEllipsis = (needEllipsis: boolean) => [
    needEllipsis && (
      <span aria-hidden key="ellipsis">
        {ELLIPSIS_STR}
      </span>
    ),
    ellipsisConfig.suffix,
    renderOperations(needEllipsis),
  ];

  return (
    <ReactResizeObserver onResize={onResize} disabled={!mergedEnableEllipsis || cssEllipsis}>
      <EllipsisTooltip
        title={tooltipTitle}
        enabledEllipsis={mergedEnableEllipsis}
        isEllipsis={isMergedEllipsis}
      >
        <Typography
          className={classNames(
            {
              [`${prefixCls}-${type}`]: type,
              [`${prefixCls}-${suffixCls}`]: suffixCls,
              [`${prefixCls}-disabled`]: disabled,
              [`${prefixCls}-ellipsis`]: enableEllipsis,
              [`${prefixCls}-single-line`]: mergedEnableEllipsis && rows === 1,
              [`${prefixCls}-ellipsis-single-line`]: cssTextOverflow,
              [`${prefixCls}-ellipsis-multiple-line`]: cssLineClamp,
            },
            className,
          )}
          style={{
            ...style,
            WebkitLineClamp: cssLineClamp ? rows : undefined,
          }}
          component={component}
          ref={composeRef(typographyRef, ref)}
          aria-label={topAriaLabel}
          title={title}
          {...textProps}
        >
          <Ellipsis
            enabledMeasure={mergedEnableEllipsis && !cssEllipsis}
            text={children}
            rows={rows}
            width={ellipsisWidth}
            onEllipsis={onJsEllipsis}
          >
            {(node, needEllipsis) => {
              let renderNode: ReactNode = node;
              if (node.length && needEllipsis && topAriaLabel) {
                renderNode = (
                  <span key="show-content" aria-hidden>
                    {renderNode}
                  </span>
                );
              }

              const wrappedContext = wrapperDecorations(
                props,
                <>
                  {renderNode}
                  {renderEllipsis(needEllipsis)}
                </>,
              );

              return wrappedContext;
            }}
          </Ellipsis>
        </Typography>
      </EllipsisTooltip>
    </ReactResizeObserver>
  );
});


Base.displayName = 'Base';

Base._PRO_TYPOGRAPHY_BASE = true;

Base.defaultProps = {
  component: 'div',
};

export default Base;


