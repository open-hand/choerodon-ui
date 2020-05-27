import Mock from 'mockjs';

const dsMutationsT = {
  rows: [],
  total: 1000,
  success: '@boolean()',
};
const dsQueriesT = {
  'rows|200': [
    {
      userid: '@guid()',
      'age|18-100': 34,
      name: '@cname()',
      email: '@first()',
      code_description: '员工状态',
      code_code: 'HR.EMPLOYEE_STATUS',
      code_select: 'HR.EMPLOYEE_GENDER',
      codeMultiple_description: '@last(),@last()',
      codeMultiple_code: [/1[0-9]{10}/, /1[0-9]{10}/],
      sex: /[MF]/,
      'sexMultiple|1-2': [/[MF]/],
      account: {
        multiple: /M|F|M,F|F,M/,
      },
      enable: '@boolean()',
      frozen: /[NY]/,
      date: {
        startDate: null,
        endDate: null,
      },
      other: {
        'enemy|3': [
          {
            userid: '@guid()',
            'age|18-100': 34,
            name: '@cname()',
            sex: /[MF]/,
            'friends|3': [
              {
                userid: '@guid()',
                'age|18-100': 34,
                name: '@cname()',
                sex: /[MF]/,
              },
            ],
          },
        ],
      },
    },
  ],
  total: 1000,
  success: true,
};

const dsLanguagesT = {
  rows: [
    {
      name: {
        zh_CN: '@cname()',
        en_GB: '@name()',
        en_US: '@name()',
        ja_JP: '桥本@clast()',
      },
      'first-name': {
        zh_CN: '@cname()',
        en_GB: '@name()',
        en_US: '@name()',
        ja_JP: '本田@clast()',
      },
    },
  ],
  total: 1,
  success: true,
};
const dsValidateT = [true];

const dsMutationsR = /\/dataset\/user\/mutations/;
const dsQueriesR = /\/dataset\/user\/queries/;
const dsLanguagesR = /\/dataset\/user\/languages/;
const dsValidateR = /\/dataset\/user\/validate/;
const dsMutationsD = Mock.mock(dsMutationsT);
const dsQueriesD = Mock.mock(dsQueriesT);
const dsLanguagesD = Mock.mock(dsLanguagesT);
const dsValidateD = Mock.mock(dsValidateT);

export default function () {
  if (typeof window !== 'undefined') {
    Mock.mock(dsMutationsR, dsMutationsT);

    Mock.mock(dsQueriesR, dsQueriesT);

    Mock.mock(dsLanguagesR, dsLanguagesT);

    Mock.mock(dsValidateR, dsValidateT);
  }
}

export const dsTempleList = [
  { rule: dsMutationsR, data: dsMutationsD },
  { rule: dsQueriesR, data: dsQueriesD },
  { rule: dsLanguagesR, data: dsLanguagesD },
  { rule: dsValidateR, data: dsValidateD },
];
