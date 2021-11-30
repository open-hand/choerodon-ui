import Mock from 'mockjs';

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

const dsFormQueryData = Mock.mock(dsFormQueryTemple);

const dsFormQueryRule = /\/secretField\/queryField/;

export default function () {
  if (typeof window !== 'undefined') {
    Mock.setup({ timeout: 0 });

    Mock.mock(dsFormQueryRule, dsFormQueryTemple);
  }
}

export const secretFieldTempleList = [
  { rule: dsFormQueryRule, data: dsFormQueryData },
];
