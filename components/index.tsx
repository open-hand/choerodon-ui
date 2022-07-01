/* @remove-on-es-build-begin */

const ENV = process.env.NODE_ENV;
if (ENV !== 'production' &&
  ENV !== 'test' &&
  typeof console !== 'undefined' &&
  console.warn &&
  typeof window !== 'undefined') {
  console.warn(
    'You are using a whole package of choerodon-ui, ' +
    'please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.',
  );
}
/* @remove-on-es-build-end */

export { default as Affix } from './affix';

export { default as Anchor } from './anchor';

export { default as Animate } from './animate';

export { default as AutoComplete } from './auto-complete';

export { default as Alert } from './alert';

export { default as Avatar } from './avatar';

export { default as BackTop } from './back-top';

export { default as Badge } from './badge';

export { default as BarCode } from './bar-code';

export { default as Breadcrumb } from './breadcrumb';

export { default as Button } from './button';

export { default as Calendar } from './calendar';

export { default as Card } from './card';

export { default as Collapse } from './collapse';

export { default as Carousel } from './carousel';

export { default as Cascader } from './cascader';

export { default as Checkbox } from './checkbox';

export { default as Col } from './col';

export { default as ConfigProvider } from './config-provider';

export { default as configure } from './configure';

export { default as DatePicker } from './date-picker';

export { default as Divider } from './divider';

export { default as Dropdown } from './dropdown';

export { default as Form } from './form';

export { default as getConfig } from './get-config';

export { default as Icon } from './icon';

export { default as IconSelect } from './icon-select';

export { default as ImageCrop } from './image-crop';

export { default as Input } from './input';

export { default as InputNumber } from './input-number';

export { default as Layout } from './layout';

export { default as List } from './list';

export { default as LocaleProvider } from './locale-provider';

export { default as message } from './message';

export { default as Menu } from './menu';

export { default as Modal } from './modal';

export { default as notification } from './notification';

export { default as Pagination } from './pagination';

export { default as Popconfirm } from './popconfirm';

export { default as Popover } from './popover';

export { default as Progress } from './progress';

export { default as Radio } from './radio';

export { default as Rate } from './rate';

export { default as Responsive } from './responsive';

export { default as Result } from './result';

export { default as Row } from './row';

export { default as Select } from './select';

export { default as Slider } from './slider';

export { default as Spin } from './spin';

export { default as Statistic } from './statistic';

export { default as Steps } from './steps';

export { default as Switch } from './switch';

export { default as Skeleton } from './skeleton';

export { default as Table } from './table';

export { default as Transfer } from './transfer';

export { default as Tree } from './tree';

export { default as TreeSelect } from './tree-select';

export { default as Tabs } from './tabs';

export { default as Tag } from './tag';

export { default as TimePicker } from './time-picker';

export { default as Timeline } from './timeline';

export { default as Tooltip } from './tooltip';

export { default as Upload } from './upload';

export { default as WaterMark } from './watermark';

export { default as useConfig } from './use-config';

export { default as version } from './version';
