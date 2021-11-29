import Mock from 'mockjs';

const dsFormTemple = JSON.parse(`[{"phone":"153*****560", "bankCard":"123*****456", "idCard":"322*****001", "_token":"111"}]`);
const dsFormQueryTemple = {
  'phone': '15312312560',
  'bankCard': '1234567890123456',
  'idCard': '322234567890356001',
  'secretField': [
    {
      secretField: 'test1',
      _token:'111',
    },
    {
      secretField: 'test2',
      _token:'222',
    },
  ],
  'secretField1': [
    {
      secretField1: 'test1',
      _token:'111',
    },
    {
      secretField1: 'test2',
      _token:'222',
    },
  ],
};

const dsTableTemple = [
  {
    secretField: 't***1',
    secretField1: 't***1',
    _token:'111',
  },
  {
    secretField: 't***2',
    secretField1: 't***2',
    _token:'222',
  },
];

const dsFormData = Mock.mock(dsFormTemple);
const dsFormQueryData = Mock.mock(dsFormQueryTemple);
const dsTableData = Mock.mock(dsTableTemple);

const dsFormRule = /\/secretField\/form\/query/;
const dsFormQueryRule = /\/secretField\/queryField/;
const dsTableRule = /\/secretField\/table\/query/;

export default function () {
  if (typeof window !== 'undefined') {
    Mock.setup({ timeout: 0 });

    Mock.mock(dsFormRule, dsFormTemple);
    Mock.mock(dsFormQueryRule, dsFormQueryTemple);
    Mock.mock(dsTableRule, dsTableTemple);
  }
}

export const secretFieldTempleList = [
  { rule: dsFormRule, data: dsFormData },
  { rule: dsFormQueryRule, data: dsFormQueryData },
  { rule: dsTableRule, data: dsTableData },
];
