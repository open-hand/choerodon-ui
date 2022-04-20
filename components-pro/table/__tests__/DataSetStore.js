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
