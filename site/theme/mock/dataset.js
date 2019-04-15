import Mock from 'mockjs';

if (typeof window !== 'undefined') {
  Mock.mock(/\/dataset\/user\/mutations/, {
    rows: [],
    total: 1000,
    success: true,
  });

  Mock.mock(/\/dataset\/user\/queries/, {
    'rows|10': [{
      userid: '@guid()',
      'age|18-100': 34,
      name: '@cname()',
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
        'enemy|3': [{
          userid: '@guid()',
          'age|18-100': 34,
          name: '@cname()',
          sex: /[MF]/,
          'friends|3': [{
            userid: '@guid()',
            'age|18-100': 34,
            name: '@cname()',
            sex: /[MF]/,
          }],
        }],
      },
    }],
    total: 1000,
    success: true,
  });

  Mock.mock(/\/dataset\/user\/languages/, {
    rows: [{
      name: {
        zh_CN: '',
        en_GB: '@name()',
        en_US: '@name()',
      },
      'first-name': {
        zh_CN: '@cname()',
        en_GB: '@name()',
        en_US: '@name()',
      },
    }],
    total: 1,
    success: true,
  });

  Mock.mock(/\/dataset\/user\/validate/, ['@boolean()']);
}
