import Mock from 'mockjs';
import { treeMockTemple } from './tree';

const dataSetLovTempleSize10Page1 = {
  rows: [
    {
      _token: '5fd2371f43d3c75c44682b0750e7bfb5',
      objectVersionNumber: 2,
      code: 'HR.EMPLOYEE_GENDER',
      codeId: 10001,
      codeValues: null,
      description: '性别',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
      homeUrl: 'https://open.hand-china.com/choerodon-ui/zh',
      selfie: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      percent: 12345.556,
      numberDemo: 1234567,
    },
    {
      _token: 'd8f3d1a86b47be97d570220f09f9da70',
      objectVersionNumber: 1,
      code: 'HR.EMPLOYEE_STATUS',
      codeId: 10002,
      codeValues: null,
      description: '员工状态',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
      percent: 0.123456789,
      numberDemo: 1234567.12345,
    },
    {
      _token: 'fef2a3f782a4aef3f550590981f54b11',
      objectVersionNumber: 1,
      code: 'SYS.ALIGN_TYPE',
      codeId: 10003,
      codeValues: null,
      description: '对齐方式',
      type: 'USER',
      enabledFlag: 'N',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: 'f2d56a73573733af27b46d981771f692',
      objectVersionNumber: 1,
      code: 'SYS.CAPTCHA_POLICY',
      codeId: 10004,
      codeValues: null,
      description: '验证码策略',
      type: 'USER',
      enabledFlag: 'N',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '690beb6510bccb2eeb906c736f7cfdc9',
      objectVersionNumber: 1,
      code: 'SYS.LOV_EDITOR_TYPE',
      codeId: 10005,
      codeValues: null,
      description: 'LOV编辑器类型',
      type: 'USER',
      enabledFlag: 'N',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '1d600f30fa2bfbf98061c8a3cb9a7c6c',
      objectVersionNumber: 1,
      code: 'SYS.PRIORITY_LEVEL',
      codeId: 10006,
      codeValues: null,
      description: '模板优先级',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '457a1217cc9343c41d41d5de1e2d6f1e',
      objectVersionNumber: 1,
      code: 'SYS.PROFILE_LEVEL_ID',
      codeId: 10007,
      codeValues: null,
      description: '配置文件级别',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '50f8dd1303a2c82557246dc296cc9d94',
      objectVersionNumber: 1,
      code: 'SYS.RESOURCE_TYPE',
      codeId: 10008,
      codeValues: null,
      description: '资源类型',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: 'a8830b9049e26a3b2cdd851d42a02b97',
      objectVersionNumber: 1,
      code: 'SYS.TIME_ZONE',
      codeId: 10009,
      codeValues: null,
      description: '时区',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '11cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS',
      codeId: 10010,
      codeValues: null,
      description: '用户状态',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
  ],
  success: true,
  total: 20,
};

const dataSetLovTempleSize10Page2 = {
  rows: [
    {
      _token: '31cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS11',
      codeId: 10011,
      codeValues: null,
      description: '用户状态11',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '12cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS12',
      codeId: 10012,
      codeValues: null,
      description: '用户状态12',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '13cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS13',
      codeId: 10013,
      codeValues: null,
      description: '用户状态13',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '14cb91cfc0d1d59335ba6607e42c640c2',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS14',
      codeId: 10014,
      codeValues: null,
      description: '用户状态14',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '15cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS15',
      codeId: 10015,
      codeValues: null,
      description: '用户状态15',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '16cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS16',
      codeId: 10016,
      codeValues: null,
      description: '用户状态16',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '17cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS17',
      codeId: 10017,
      codeValues: null,
      description: '用户状态17',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '18cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS18',
      codeId: 10018,
      codeValues: null,
      description: '用户状态18',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '19cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS19',
      codeId: 10019,
      codeValues: null,
      description: '用户状态19',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
    {
      _token: '20cb91cfc0d1d59335ba6607e42c640c',
      objectVersionNumber: 1,
      code: 'SYS.USER_STATUS20',
      codeId: 10020,
      codeValues: null,
      description: '用户状态20',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
    },
  ],
  success: true,
  total: 20,
};


const dataSetLovTemple = {
  rows: [
    ...dataSetLovTempleSize10Page1.rows,
    ...dataSetLovTempleSize10Page2.rows,
  ],
  success: true,
  total: 20,
};

const dataSetLovDetailTemple = {
  rows: [
    {
      _token: '5fd2371f43d3c75c44682b0750e7bfb5',
      objectVersionNumber: 2,
      code: 'HR.EMPLOYEE_GENDER',
      codeId: 10001,
      codeValues: null,
      description: '性别',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
      homeUrl: 'https://open.hand-china.com/choerodon-ui/zh',
      selfie: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      percent: 0.55,
    },
    {
      _token: 'd8f3d1a86b47be97d570220f09f9da70',
      objectVersionNumber: 1,
      code: 'HR.EMPLOYEE_STATUS',
      codeId: 10002,
      codeValues: null,
      description: '员工状态',
      type: 'USER',
      enabledFlag: 'Y',
      parentCodeId: null,
      parentCodeDescription: null,
      percent: 0.123456789,
    },
  ],
  success: true,
  total: 2,
};

const dataSetLovMockTemple = {
  'rows|10': [
    {
      _token: '@guid()',
      'objectVersionNumber|1-10': 1,
      code: '@pick([\'HR\', \'SYS\']).@upper(@word)',
      'codeId|+1': 10001,
      codeValues: '@ctitle()',
      description: '@ctitle()',
      type: '@name',
      enabledFlag: /[NY]/,
      parentCodeId: [/1[0-9]{10}/, /1[0-9]{10}/],
      parentCodeDescription: '@sentence(3, 6)',
    },
  ],
  success: true,
  total: 35,
};

const lovDefineTemple = {
  _token: '@guid()',
  objectVersionNumber: 1,
  code: 'LOV_CODE',
  description: '快码',
  height: null,
  lovId: 10015,
  lovItems: [
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10033,
      lovId: 10015,
      display: '代码',
      gridFieldName: 'code',
      gridFieldWidth: 300,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'Y',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 1,
      gridFieldSequence: 1,
    },
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10034,
      lovId: 10015,
      display: '描述',
      gridFieldName: 'description',
      gridFieldWidth: 300,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'Y',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 2,
      gridFieldSequence: 2,
    },
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10035,
      lovId: 10015,
      display: '主页',
      gridFieldName: 'homeUrl',
      gridFieldWidth: 150,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'N',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 3,
      gridFieldSequence: 3,
      gridFieldType: 'HREF',
    },
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10036,
      lovId: 10015,
      display: '头像',
      gridFieldName: 'selfie',
      gridFieldWidth: 100,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'N',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 4,
      gridFieldSequence: 4,
      gridFieldType: 'PICTURE',
    },
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10037,
      lovId: 10015,
      display: '完成百分比',
      gridFieldName: 'percent',
      gridFieldWidth: 100,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'Y',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: 'INT',
      conditionFieldName: 'percent',
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 4,
      gridFieldSequence: 4,
      gridFieldType: 'PERCENT',
    },
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10038,
      lovId: 10015,
      display: '数字',
      gridFieldName: 'numberDemo',
      gridFieldWidth: 150,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'Y',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: 'INT',
      conditionFieldName: 'numberDemo',
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 4,
      gridFieldSequence: 4,
      gridFieldType: 'INT',
    },
  ],
  placeholder: '请选择快码',
  sqlId: 'CodeMapper.select',
  customSql: null,
  queryColumns: 3,
  customUrl: null,
  textField: 'description',
  title: '父级快码',
  valueField: 'code',
  width: 710,
  delayLoad: 'N',
  needQueryParam: 'N',
  editableFlag: 'Y',
  canPopup: 'Y',
  lovPageSize: '10',
  treeFlag: 'N',
  idField: null,
  parentIdField: null,
  detailUrl: '/common/lov/dataset/detail/LOV_CODE',
  detailField: 'code',
};
const lovMockDefineTemple = {
  _token: '@guid()',
  objectVersionNumber: 1,
  code: 'LOV_MOCK_CODE',
  description: '快码',
  height: null,
  lovId: 10015,
  lovItems: [
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10033,
      lovId: 10015,
      display: '代码',
      gridFieldName: 'code',
      gridFieldWidth: 150,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'Y',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: 80,
      conditionFieldType: null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 1,
      gridFieldSequence: 1,
    },
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10034,
      lovId: 10015,
      display: '描述',
      gridFieldName: 'description',
      gridFieldWidth: 250,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'Y',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: 80,
      conditionFieldType: null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 2,
      gridFieldSequence: 2,
    },
  ],
  placeholder: '请选择快码',
  sqlId: 'CodeMapper.select',
  customSql: null,
  queryColumns: 1,
  customUrl: null,
  textField: 'description',
  title: '父级快码',
  valueField: 'code',
  width: 520,
  delayLoad: 'N',
  needQueryParam: 'N',
  editableFlag: 'Y',
  canPopup: 'Y',
  lovPageSize: '10',
  treeFlag: 'N',
  idField: null,
  parentIdField: null,
  detailUrl: undefined,
  detailField: 'code',
};
const lovTreeDefineTemple = {
  _token: '@guid()',
  objectVersionNumber: 1,
  code: 'LOV_TREE_CODE',
  description: '快码',
  height: null,
  lovId: 10015,
  lovItems: [
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10033,
      lovId: 10015,
      display: '页面地址',
      gridFieldName: 'url',
      gridFieldWidth: 300,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'N',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 1,
      gridFieldSequence: 2,
    },
    {
      _token: '@guid()',
      objectVersionNumber: 1,
      lovItemId: 10034,
      lovId: 10015,
      display: '功能名称',
      gridFieldName: 'text',
      gridFieldWidth: 300,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'Y',
      isAutocomplete: 'N',
      gridField: 'Y',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSelectCode: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 2,
      gridFieldSequence: 1,
    },
  ],
  placeholder: '请选择功能',
  sqlId: 'CodeMapper.select',
  customSql: null,
  queryColumns: 2,
  customUrl: null,
  textField: 'text',
  title: '父级功能',
  valueField: 'id',
  width: 710,
  delayLoad: 'N',
  needQueryParam: 'N',
  editableFlag: 'Y',
  canPopup: 'Y',
  lovPageSize: '10',
  treeFlag: 'Y',
  idField: 'id',
  parentIdField: 'parentId',
  tableProps: {
    style: {
      maxHeight: 'calc(100vh - 400px)',
    },
  },
  detailUrl: undefined,
  detailField: undefined,
};

const dataSetLovData10Page1 = Mock.mock(dataSetLovTempleSize10Page1);
const dataSetLovData10Page2 = Mock.mock(dataSetLovTempleSize10Page2);
const dataSetLovData = Mock.mock(dataSetLovTemple);
const dataSetLovMockData = Mock.mock(dataSetLovMockTemple);
const dataSetLovTreeData = Mock.mock(treeMockTemple);
const dataSetLovDetailData = Mock.mock(dataSetLovDetailTemple);

const lovDefineData = Mock.mock(lovDefineTemple);
const lovDefineMockData = Mock.mock(lovMockDefineTemple);
const lovDefineTreeData = Mock.mock(lovTreeDefineTemple);

const dataSetLovRuleSize10Page1 = /\/common\/lov\/dataset\/LOV_CODE\/10\/1/;
const dataSetLovRuleSize10Page2 = /\/common\/lov\/dataset\/LOV_CODE\/10\/2/;
const dataSetLovRuleSize20Page1 = /\/common\/lov\/dataset\/LOV_CODE\/20\/1/;
const dataSetLovRuleSize50Page1 = /\/common\/lov\/dataset\/LOV_CODE\/50\/1/;
const dataSetLovRuleSize100Page1 = /\/common\/lov\/dataset\/LOV_CODE\/100\/1/;
const dataSetLovRule = /\/common\/lov\/dataset\/LOV_CODE/;
const dataSetLovMockRule = /\/common\/lov\/dataset\/LOV_MOCK_CODE/;
const dataSetLovTreeRule = /\/common\/lov\/dataset\/LOV_TREE_CODE/;
const dataSetLovDetailRule = /\/common\/lov\/dataset\/detail\/LOV_CODE/;

const lovDefineRule = /\/sys\/lov\/lov_define\?code=LOV_CODE/;
const lovDefineMockRule = /\/sys\/lov\/lov_define\?code=LOV_MOCK_CODE/;
const lovTreeDefineRule = /\/sys\/lov\/lov_define\?code=LOV_TREE_CODE/;

export default function () {
  if (typeof window !== 'undefined') {
    Mock.setup({ timeout: 0 });

    Mock.mock(dataSetLovRuleSize10Page1, dataSetLovData10Page1);

    Mock.mock(dataSetLovRuleSize10Page2, dataSetLovData10Page2);

    Mock.mock(dataSetLovRuleSize20Page1, dataSetLovTemple);

    Mock.mock(dataSetLovRuleSize50Page1, dataSetLovTemple);

    Mock.mock(dataSetLovRuleSize100Page1, dataSetLovTemple);

    Mock.mock(dataSetLovRule, dataSetLovTemple);

    Mock.mock(dataSetLovMockRule, dataSetLovMockTemple);

    Mock.mock(dataSetLovTreeRule, treeMockTemple);

    Mock.mock(lovDefineRule, lovDefineTemple);

    Mock.mock(lovDefineMockRule, lovMockDefineTemple);

    Mock.mock(lovTreeDefineRule, lovTreeDefineTemple);

    Mock.mock(dataSetLovDetailRule, dataSetLovDetailTemple);
  }
}

export const lovTempleList = [
  { rule: dataSetLovRuleSize10Page1, data: dataSetLovData10Page1 },
  { rule: dataSetLovRuleSize10Page2, data: dataSetLovData10Page2 },
  { rule: dataSetLovRuleSize20Page1, data: dataSetLovData },
  { rule: dataSetLovRuleSize50Page1, data: dataSetLovData },
  { rule: dataSetLovRuleSize100Page1, data: dataSetLovData },
  { rule: dataSetLovRule, data: dataSetLovData },
  { rule: dataSetLovMockRule, data: dataSetLovMockData },
  { rule: dataSetLovTreeRule, data: dataSetLovTreeData },
  { rule: lovDefineRule, data: lovDefineData },
  { rule: lovDefineMockRule, data: lovDefineMockData },
  { rule: lovTreeDefineRule, data: lovDefineTreeData },
  { rule: dataSetLovDetailRule, data: dataSetLovDetailData },
];
