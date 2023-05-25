import Mock from 'mockjs';

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
      orderSeq: 20,
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
      orderSeq: 20,
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
const d6 = {
  'HR.EMPLOYEE_GENDER': d2.rows,
  'SYS.USER_STATUS': d3.rows,
  SHENG: d4.rows,
  SHI: d5.rows,
};

const d7 = {
  rows: [
    {
      _token: '383aa9f02290742d77bbb1200be8a95e',
      objectVersionNumber: 2,
      codeId: 10067,
      codeValueId: 10204,
      description: '女裤装',
      meaning: '女裤装',
      value: 'womenPants',
      orderSeq: null,
      tag: null,
    },
    {
      _token: '68db92966e875bdd16a9d38ef27e90d8',
      objectVersionNumber: 2,
      codeId: 10067,
      codeValueId: 10205,
      description: '男下装',
      meaning: '男下装',
      value: 'manPants',
      orderSeq: null,
      tag: null,
      enabledFlag: 'Y',
    },
    {
      _token: '380ee41f753c1aa563dfdc48aded0309',
      objectVersionNumber: 1,
      codeId: 10067,
      codeValueId: 10208,
      description: '中大童装',
      meaning: '中大童装',
      value: 'kidsOverSize',
      orderSeq: 10,
      tag: null,
      enabledFlag: 'Y',
    },
    {
      _token: 'f5167255b276b5cdd677d175eee0a122',
      objectVersionNumber: 1,
      codeId: 10067,
      codeValueId: 10209,
      description: '运动服',
      meaning: '运动服',
      value: 'sportWear',
      orderSeq: 10,
      tag: null,
      enabledFlag: 'Y',
    },
    {
      _token: 'f5167255b276b5cdd677d175eee0a123',
      objectVersionNumber: 1,
      codeId: 10067,
      codeValueId: 10209,
      description: '冬装',
      meaning: '冬装',
      value: 'snowsuit',
      orderSeq: 10,
      tag: null,
      enabledFlag: 'Y',
    },
    {
      _token: 'f5167255b276b5cdd677d175eee0a124',
      objectVersionNumber: 1,
      codeId: 10067,
      codeValueId: 10209,
      description: '睡衣/家居服',
      meaning: '睡衣/家居服',
      value: 'nighty',
      orderSeq: 10,
      tag: null,
      enabledFlag: 'Y',
    },
    {
      _token: 'f5167255b276b5cdd677d175eee0a125',
      objectVersionNumber: 1,
      codeId: 10067,
      codeValueId: 10209,
      description: '内裤',
      meaning: '内裤',
      value: 'brlefs',
      orderSeq: 10,
      tag: null,
      enabledFlag: 'Y',
    },
    {
      _token: 'f5167255b276b5cdd677d175eee0a126',
      objectVersionNumber: 1,
      codeId: 10067,
      codeValueId: 10209,
      description: '婴幼童装',
      meaning: '婴幼童装',
      value: 'chilrenWear',
      orderSeq: 10,
      tag: null,
      enabledFlag: 'Y',
    },
    {
      _token: 'f5167255b276b5cdd677d175eee0a127',
      objectVersionNumber: 1,
      codeId: 10067,
      codeValueId: 10209,
      description: '女裙装/套装',
      meaning: '女裙装/套装',
      value: 'jupeSult',
      orderSeq: 10,
      tag: null,
      enabledFlag: 'Y',
    },
    {
      _token: 'f5167255b276b5cdd677d175eee0a128',
      objectVersionNumber: 1,
      codeId: 10067,
      codeValueId: 10209,
      description: '保暖内衣',
      meaning: '保暖内衣',
      value: 'thermalUnderWear',
      orderSeq: 10,
      tag: null,
      enabledFlag: 'Y',
    },
  ],
};

const data1 = Mock.mock(d1);
const data2 = Mock.mock(d2);
const data3 = Mock.mock(d3);
const data4 = Mock.mock(d4);
const data5 = Mock.mock(d5);
const data6 = Mock.mock(d6);
const data7 = Mock.mock(d7);

const rul1 = /\/common\/code\/HR.EMPLOYEE_GENDER\/\?key/;
const rul2 = /\/common\/code\/HR.EMPLOYEE_GENDER\//;
const rul3 = /\/common\/code\/SYS.USER_STATUS\//;
const rul4 = /\/common\/code\/SHENG\//;
const rul5 = /\/common\/code\/SHI\//;
const rul6 = /\/common\/batch/;
const rul7 = /\/common\/code\/WEAR\//;

export default function() {
  if (typeof window !== 'undefined') {
    Mock.setup({timeout:0})

    Mock.mock(rul1, d1);

    Mock.mock(rul2, d2);

    Mock.mock(rul3, d3);

    Mock.mock(rul4, d4);

    Mock.mock(rul5, d5);

    Mock.mock(rul6, d6);

    Mock.mock(rul7, d7);
  }
}

export const lookupTempleList = [
  { rule: rul1, value: data1 },
  { rule: rul2, value: data2 },
  { rule: rul3, value: data3 },
  { rule: rul4, value: data4 },
  { rule: rul5, value: data5 },
  { rule: rul6, value: data6 },
  { rule: rul7, value: data7 },
];
