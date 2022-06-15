export const columnDSObj = {
  primaryKey: 'userid',
  transport: {
    read({ params: { page, pagesize } }) {
      return {
        url: `/dataset/user/page/${pagesize}/${page}`,
      };
    },
  },
  autoQuery: true,
  pageSize: 5,
  queryFields: [
    { name: 'name', type: 'string', label: '姓名' },
    { name: 'age', type: 'number', label: '年龄' },
    { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
    { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
    { name: 'date.startDate', type: 'date', label: '开始日期' },
    {
      name: 'sexMultiple',
      type: 'string',
      label: '性别（多值）',
      lookupCode: 'HR.EMPLOYEE_GENDER',
      multiple: true,
    },
  ],
  fields: [
    { name: 'userid', type: 'string', label: '编号', required: true },
    { name: 'name', type: 'string', label: '姓名' },
    { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
    { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
    { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
    {
      name: 'sexMultiple',
      type: 'string',
      label: '性别（多值）',
      lookupCode: 'HR.EMPLOYEE_GENDER',
      multiple: true,
    },
  ],
};

export const aggregationDSObj = {
  primaryKey: 'userid',
  autoQuery: false,
  pageSize: 5,
  fields: [
    { name: 'userid', type: 'string', label: '编号', required: true },
    { name: 'name', type: 'string', label: '姓名' },
    { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
    { name: 'startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
    { name: 'endDate', type: 'date', label: '结束日期', defaultValue: new Date() },

  ],
  data: [
    { userid: '0', name: '彭霞', age: 63, startDate: new Date('2022-04-01'), endDate: new Date('2022-06-01') },
    { userid: '1', name: '孔秀兰', age: 84, startDate: new Date('2022-05-01'), endDate: new Date('2022-06-01') },
    { userid: '2', name: '孟艳', age: 70, startDate: new Date('2022-03-01'), endDate: new Date('2022-06-01') },
  ],
};

export const queryFieldDSObj = {
  primaryKey: 'userid',
  autoQuery: false,
  pageSize: 5,
  fields: [
    { name: 'userid', type: 'string', label: '编号', required: true },
    { name: 'name', type: 'string', label: '姓名' },
    { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
    { name: 'startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
    { name: 'endDate', type: 'date', label: '结束日期', defaultValue: new Date() },

  ],
  queryFields: [
    // 字段顺序不可变，第一个需要是number类型
    { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
    { name: 'name', type: 'string', label: '姓名' },
    { name: 'userid', type: 'string', label: '编号', required: true },
    { name: 'startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
    { name: 'endDate', type: 'date', label: '结束日期', defaultValue: new Date() },
  ],
  data: [
    { userid: '0', name: '彭霞', age: 63, startDate: new Date('2022-04-01'), endDate: new Date('2022-06-01') },
    { userid: '1', name: '孔秀兰', age: 84, startDate: new Date('2022-05-01'), endDate: new Date('2022-06-01') },
    { userid: '2', name: '孟艳', age: 70, startDate: new Date('2022-03-01'), endDate: new Date('2022-06-01') },
  ],
};
