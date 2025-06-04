import React, { FunctionComponent, ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import Alert from 'choerodon-ui/lib/alert';
import { getConfig } from 'choerodon-ui/lib/configure';
import Popover from 'choerodon-ui/lib/popover';
import { action } from 'mobx';
import { Clipboard } from './Table';
import Radio from '../radio';
import Typography from '../typography';
import isOverflow from '../overflow-tip/util';
import { hide, show } from '../tooltip/singleton';
import { exportExcel } from '../data-set/utils';
import TableContext from './TableContext';
import { $l } from '../locale-context';
import Tooltip from '../tooltip';
import Button from '../button';
import { ButtonColor, FuncType } from '../button/enum';
import { Size } from '../core/enum';
import message from '../message';

const { Text } = Typography;

export interface ClipboardBarProps {
  clipboard: Clipboard;
}

const ClipboardBar: FunctionComponent<ClipboardBarProps> = function ClipboardBar(props) {
  const { clipboard } = props;
  const { tableStore, prefixCls, dataSet } = useContext(TableContext);

  const refText = useRef<HTMLDivElement>(null);

  const handleDownloadtemplate = useCallback(() => {
    const getXlsxConfig = getConfig('xlsx');
    if (getXlsxConfig.name !== 'xlsx') {
      message.warning($l('Table', 'no_xlsx'));
      return;
    }
    const { columnGroups: { leafs } } = tableStore;
    const templateHeader = {}; // 表头
    const templateType = {}; // 字段类型
    const templateIsMutiple = {}; // 是否多值
    for (let i = 0; i < leafs.length; i++) {
      const item = leafs[i];
      const columnName = item && item.column.name;
      if (columnName) {
        const field = dataSet.fields.get(columnName)
        if (field) {
          const label = field.get('label');
          const type = field.get('type');
          const isMutiple = field.get('multiple');
          templateHeader[columnName] = label;
          templateType[columnName] = type;
          templateIsMutiple[columnName] = isMutiple;
        }
      }
    }
    const data: any = [];
    // 模拟 5 条数据
    if (!clipboard.onlyTemplateHeader) {
      for (let i = 0; i < 5; i++) {
        const row = {};
        Object.keys(templateHeader).forEach(key => {
          switch (templateType[key]) {
            case "string":
            case "intl":
              row[key] = templateIsMutiple[key] ? '文字1,文字2' : '文字';
              break;
            case "number":
              row[key] = templateIsMutiple[key] ? "10, 20" : Math.floor(Math.random() * 100 + 1);
              break;
            case "boolean":
              row[key] = Math.random() > 0.5 ? "是" : "否";
              break;
            case "object":
              row[key] = templateIsMutiple[key] ? "LOV相关文字1,LOV相关文字2" : "LOV相关文字";
              break;
            case "date":
              row[key] = templateIsMutiple[key] ? `2023-07-01,2023-07-02` : `2023-07-01`;
              break;
            case "dateTime":
              row[key] = templateIsMutiple[key] ? `2023-07-01 12:12:12,2023-07-02 13:13:13` : `2023-07-01 12:12:12`;
              break;
            case "year":
              row[key] = templateIsMutiple[key] ? '2023,2024' : '2023';
              break;
            case "week":
              row[key] = templateIsMutiple[key] ? '2023-20周,2023-21周' : '2023-20周';
              break;
            case "month":
              row[key] = templateIsMutiple[key] ? '2023-01,2024-01' : '2023-01';
              break;
            case "quarter":
              row[key] = templateIsMutiple[key] ? '2023-Q1,2024-Q1' : '2023-Q1';
              break;
            case "time":
              row[key] = templateIsMutiple[key] ? '05:05:00,16:14:15' : '16:14:15';
              break;
            case "email":
              row[key] = templateIsMutiple[key] ? 'xxxxxx@xxx.com,zzzzz@zzz.com' : 'xxxxxx@xxx.com';
              break;
            case "url":
              row[key] = templateIsMutiple[key] ? 'https:www.xxxxxx.com/,https:www.zzzzzz.com/' : 'https:www.xxxxxx.com/';
              break;
            case "bigNumber":
              row[key] = templateIsMutiple[key] ? '123456789.123456789,1000000.000000001' : '123456789.123456789';
              break;
            default:
              break;
          }
        });
        data.push(row);
      }
    }
    data.unshift(templateHeader);
    exportExcel(data, $l('Table', 'paste_template'), getXlsxConfig);
  }, [dataSet])

  const clipboardDescription = useMemo(() => {
    if (clipboard.description) {
      return clipboard.description;
    }
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const info: ReactNode[] = [<span key="info-header">{$l('Table', 'table_support')}</span>];
    if (clipboard.copy) {
      info.push(<span key="info-copy"> <Text keyboard>{isMac ? 'command' : 'CTRL'}+C</Text> {$l('Table', 'ctrl_c_info')}</span>);
    }
    if (clipboard.paste) {
      info.push(<span key="info-paste"> <Text keyboard>{isMac ? 'command' : 'CTRL'}+V</Text> {$l('Table', 'ctrl_v_info')}</span>);
    }
    return info;
  }, [clipboard])

  const handleChange = useCallback(action<(val: string) => void>((value) => {
    tableStore.isCopyPristine = value === 'pristine';
    // 切换之后，Table 聚焦
    tableStore.node.focus();
  }), []);

  const suffixInfo = useMemo(() => {
    const btn: ReactNode[] = [];
    if (clipboard.copy) {
      btn.push(
        <Popover
          key="clipboard-copy"
          trigger="hover"
          content={
            <form>
              <Radio name="base" value="display" defaultChecked onChange={handleChange}>{$l('Table', 'copy_display')}</Radio>
              <Radio name="base" value="pristine" onChange={handleChange}>{$l('Table', 'copy_pristine')}</Radio>
            </form>
          }
        >
          <a>{$l('Table', 'copy_config')}</a>
        </Popover>,
      )
    }
    if (clipboard.paste) {
      btn.push(
        [
          <a key="clipboard-paste" onClick={handleDownloadtemplate} style={{ marginLeft: clipboard.copy ? '0.16rem' : 0 }}>{$l('Table', 'download_table_template')}</a>,
          <Tooltip title={$l('Table', 'download_table_template_tooltip')} theme="light" key="download_table_template">
            <Button funcType={FuncType.flat} color={ButtonColor.primary} size={Size.small} icon='help_outline' />
          </Tooltip>,
        ],
      )
    }
    return btn;
  }, [clipboard])

  const handleMouseEnter = useCallback(() => {
    if (refText.current && isOverflow(refText.current)) {
      show(refText.current, {
        title: clipboardDescription,
        theme: 'dark',
      });
    }
  }, [clipboard, refText])

  const handleMouseLeave = useCallback(() => {
    if (refText.current) {
      hide();
    }
  }, [refText]);

  return (
    <div className={`${prefixCls}-clipboard`}>
      <Alert
        closable
        className={`${prefixCls}-clipboard-alert`}
        message={
          <div className={`${prefixCls}-clipboard-content`}>
            <div
              ref={refText}
              className={`${prefixCls}-clipboard-content-text`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {clipboardDescription}
            </div>
            <div className={`${prefixCls}-clipboard-content-suffix`}>{suffixInfo}</div>
          </div>
        }
        type="info"
        showIcon
      />
    </div>
  );
};

ClipboardBar.displayName = 'ClipboardBar';

export default observer(ClipboardBar);
