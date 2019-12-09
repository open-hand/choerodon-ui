import Mock from 'mockjs';

export default function() {
  if (typeof window !== 'undefined') {
    const d1 = {
      rows: [
        {
          objectVersionNumber: 1,
          codeId: 10001,
          codeValueId: 10029,
          description: null,
          meaning: '老',
          value: 'O',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: null,
          parentCodeValue: null,
          parentCodeValueMeaning: null,
        },
        {
          objectVersionNumber: 1,
          codeId: 10001,
          codeValueId: 10030,
          description: null,
          meaning: '少',
          value: 'Y',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: null,
          parentCodeValue: null,
          parentCodeValueMeaning: null,
        },
      ],
    };
    const d2 = {
      rows: [
        {
          objectVersionNumber: 1,
          codeId: 10001,
          codeValueId: 10027,
          description: null,
          meaning: '女',
          value: 'F',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: null,
          parentCodeValue: null,
          parentCodeValueMeaning: null,
        },
        {
          objectVersionNumber: 1,
          codeId: 10001,
          codeValueId: 10028,
          description: null,
          meaning: '男',
          value: 'M',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: null,
          parentCodeValue: null,
          parentCodeValueMeaning: null,
        },
      ],
    };
    const d3 = {
      rows: [
        {
          objectVersionNumber: 1,
          codeId: 10010,
          codeValueId: 10021,
          description: '有效',
          meaning: '有效',
          value: 'ACTV',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: null,
          parentCodeValue: null,
          parentCodeValueMeaning: null,
        },
        {
          objectVersionNumber: 1,
          codeId: 10010,
          codeValueId: 10022,
          description: '过期',
          meaning: '过期',
          value: 'EXPR',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: null,
          parentCodeValue: null,
          parentCodeValueMeaning: null,
        },
        {
          objectVersionNumber: 1,
          codeId: 10010,
          codeValueId: 10023,
          description: '锁定',
          meaning: '已锁定',
          value: 'LOCK',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: null,
          parentCodeValue: null,
          parentCodeValueMeaning: null,
        },
      ],
    };
    const d4 = {
      rows: [
        {
          _token: '0ac5c3561d43fb2755532be093e2b5f2',
          objectVersionNumber: 1,
          codeId: 10066,
          codeValueId: 10206,
          description: '北京',
          meaning: '北京',
          value: 'BJ',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: null,
          parentCodeValue: null,
          parentCodeValueMeaning: null,
        },
        {
          _token: 'b205b085ad8457370f571330f83b13cf',
          objectVersionNumber: 1,
          codeId: 10066,
          codeValueId: 10207,
          description: '上海',
          meaning: '上海',
          value: 'SH',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: null,
          parentCodeValue: null,
          parentCodeValueMeaning: null,
        },
      ],
    };
    const d5 = {
      rows: [
        {
          _token: '383aa9f02290742d77bbb1200be8a95e',
          objectVersionNumber: 2,
          codeId: 10067,
          codeValueId: 10204,
          description: '青浦区',
          meaning: '青浦区',
          value: 'QP',
          orderSeq: null,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: 10207,
          parentCodeValue: 'SH',
          parentCodeValueMeaning: null,
        },
        {
          _token: '68db92966e875bdd16a9d38ef27e90d8',
          objectVersionNumber: 2,
          codeId: 10067,
          codeValueId: 10205,
          description: '徐汇区',
          meaning: '徐汇区',
          value: 'XH',
          orderSeq: null,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: 10207,
          parentCodeValue: 'SH',
          parentCodeValueMeaning: null,
        },
        {
          _token: '380ee41f753c1aa563dfdc48aded0309',
          objectVersionNumber: 1,
          codeId: 10067,
          codeValueId: 10208,
          description: '海定区',
          meaning: '海定区',
          value: 'HD',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: 10206,
          parentCodeValue: 'BJ',
          parentCodeValueMeaning: null,
        },
        {
          _token: 'f5167255b276b5cdd677d175eee0a121',
          objectVersionNumber: 1,
          codeId: 10067,
          codeValueId: 10209,
          description: '朝阳区',
          meaning: '朝阳区',
          value: 'CY',
          orderSeq: 10,
          tag: null,
          enabledFlag: 'Y',
          parentCodeValueId: 10206,
          parentCodeValue: 'BJ',
          parentCodeValueMeaning: null,
        },
      ],
    };

    Mock.mock(/\/common\/code\/HR.EMPLOYEE_GENDER\/\?key/, d1);

    Mock.mock(/\/common\/code\/HR.EMPLOYEE_GENDER\//, d2);

    Mock.mock(/\/common\/code\/SYS.USER_STATUS\//, d3);

    Mock.mock(/\/common\/code\/SHENG\//, d4);

    Mock.mock(/\/common\/code\/SHI\//, d5);

    Mock.mock(/\/common\/batch/, {
      'HR.EMPLOYEE_GENDER': d2.rows,
      'SYS.USER_STATUS': d3.rows,
      SHENG: d4.rows,
      SHI: d5.rows,
    });
  }
}
