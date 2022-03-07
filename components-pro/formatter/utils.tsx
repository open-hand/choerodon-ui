import { Utils } from 'choerodon-ui/dataset';

export { transformString, trimString } from 'choerodon-ui/dataset';

const toLocaleStringSupportsLocales: typeof Utils.toLocaleStringSupportsLocales = Utils.toLocaleStringSupportsLocales;
const getNumberFormatOptions: typeof Utils.getNumberFormatOptions = Utils.getNumberFormatOptions;
const toLocaleStringPolyfill: typeof Utils.toLocaleStringPolyfill = Utils.toLocaleStringPolyfill;

export { toLocaleStringSupportsLocales, getNumberFormatOptions, toLocaleStringPolyfill };
