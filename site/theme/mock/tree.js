import Mock from 'mockjs';

const lessTreeMockRootRows = [
  {
    expand: true,
    functionCode: 'HR',
    icon: 'airline_seat_flat-o',
    id: 2,
    ischecked: null,
    score: 10,
    shortcutId: null,
    text: '组织架构',
    url: null,
    symbol: '0',
  },
  {
    expand: false,
    functionCode: 'SYS_REPORT_MANAGE',
    icon: 'airline_seat_flat_angled-o',
    id: 24,
    ischecked: true,
    score: 10,
    shortcutId: null,
    text: '报表管理',
    url: null,
    symbol: '0',
  },
];
const asyncTreeMockEmpty = {
  rows: [],
  success: true,
};
const asyncTreeBlock1 = [
  ...lessTreeMockRootRows,
  {
    expand: false,
    functionCode: 'ATTACH',
    icon: 'airline_seat_flat-o',
    id: 69,
    ischecked: true,
    score: 30,
    shortcutId: null,
    text: '附件管理',
    url: null,
    symbol: '0',
  },
  {
    expand: false,
    functionCode: 'JOB',
    icon: 'airline_seat_flat-o',
    id: 16,
    ischecked: true,
    score: 40,
    shortcutId: null,
    text: '计划任务',
    url: null,
    symbol: '0',
  },
  {
    expand: false,
    functionCode: 'WFL_OFFICE',
    icon: 'airline_seat_flat-o',
    id: 39,
    ischecked: true,
    score: 49,
    shortcutId: null,
    text: '工作流',
    url: null,
    symbol: '0',
  },
];
const asyncTreeBlock2 = [
  {
    expand: false,
    functionCode: 'WFL',
    icon: 'airline_seat_flat-o',
    id: 27,
    ischecked: true,
    score: 50,
    shortcutId: null,
    text: '流程管理',
    url: null,
    symbol: '0',
  },
  {
    expand: false,
    functionCode: 'IF',
    icon: 'airline_seat_flat-o',
    id: 45,
    ischecked: true,
    score: 80,
    shortcutId: null,
    text: '接口管理',
    url: null,
    symbol: '0',
  },
  {
    expand: false,
    functionCode: 'API',
    icon: 'airline_seat_flat-o',
    id: 49,
    ischecked: true,
    score: 90,
    shortcutId: null,
    text: '服务管理',
    url: null,
    symbol: '0',
  },
  {
    expand: false,
    functionCode: 'TASK',
    icon: 'airline_seat_flat-o',
    id: 53,
    ischecked: true,
    score: 95,
    shortcutId: null,
    text: '任务管理',
    url: null,
    symbol: '0',
  },
  {
    expand: false,
    functionCode: 'SYSTEM',
    icon: 'airline_seat_flat-o',
    id: 1,
    ischecked: true,
    score: 99,
    shortcutId: null,
    text: '系统管理',
    url: null,
    symbol: '0',
  },
];
const asyncTreeMock = {
  rows: [
    ...asyncTreeBlock1,
    ...asyncTreeBlock2,
  ],
  success: true,
  total: 10,
};
const asyncTreeMockSize5Page1 = {
  rows: asyncTreeBlock1,
  success: true,
  total: 10,
};
const asyncTreeMockSize5Page2 = {
  rows: asyncTreeBlock2,
  success: true,
  total: 10,
};
const asyncTreeMock1 = {
  rows: [
    {
      expand: false,
      functionCode: 'SYS_CONFIG',
      icon: 'airline_seat_flat-o',
      id: 63,
      ischecked: true,
      score: 6,
      shortcutId: null,
      text: '系统配置',
      url: 'sys/sys_config.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'SYS_METRICS',
      icon: 'airline_seat_flat-o',
      id: 78,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '系统指标',
      url: 'sys/sys_detail_metrics.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'ACCOUNT',
      icon: 'airline_seat_flat-o',
      id: 8,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '账户管理',
      url: null,
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'FORM',
      icon: 'airline_seat_flat-o',
      id: 87,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '表单管理',
      url: 'sys/ui-builder.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'HOTKEY',
      icon: 'airline_seat_flat-o',
      id: 88,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '热键配置',
      url: 'sys/sys_hotkey.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'FUNCTION',
      icon: 'airline_seat_flat-o',
      id: 3,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '功能管理',
      url: null,
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'SYS_DASHBOARD',
      icon: 'airline_seat_flat-o',
      id: 77,
      ischecked: true,
      score: 15,
      shortcutId: null,
      text: '仪表盘配置',
      url: 'sys/sys_dashboard.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'PROMPT',
      icon: 'airline_seat_flat-o',
      id: 58,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '描述维护',
      url: 'sys/sys_prompt.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'PROMPT_REACT',
      icon: 'airline_seat_flat-o',
      id: 14,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '描述维护(react)',
      url: 'hap-core/sys/prompt',
      symbol: '1',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'CODE',
      icon: 'airline_seat_flat-o',
      id: 59,
      ischecked: true,
      score: 30,
      shortcutId: null,
      text: '代码维护',
      url: 'sys/sys_code.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'CODE_REACT',
      icon: 'airline_seat_flat-o',
      id: 4,
      ischecked: true,
      score: 30,
      shortcutId: null,
      text: '代码维护(react)',
      url: 'hap-core/sys/code',
      symbol: '1',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'LOV',
      icon: 'airline_seat_flat-o',
      id: 60,
      ischecked: true,
      score: 40,
      shortcutId: null,
      text: 'LOV定义',
      url: 'sys/sys_lov.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'SYS_CODE_RULE',
      icon: 'airline_seat_flat-o',
      id: 83,
      ischecked: true,
      score: 45,
      shortcutId: null,
      text: '编码规则',
      url: 'code/rule/code_rules.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'LANGUAGE',
      icon: 'airline_seat_flat-o',
      id: 61,
      ischecked: true,
      score: 50,
      shortcutId: null,
      text: '语言维护',
      url: 'sys/sys_language.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'LANGUAGE_REACT',
      icon: 'airline_seat_flat-o',
      id: 15,
      ischecked: true,
      score: 50,
      shortcutId: null,
      text: '语言维护(react)',
      url: 'hap-core/sys/language',
      symbol: '1',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'PROFILE',
      icon: 'airline_seat_flat-o',
      id: 62,
      ischecked: true,
      score: 50,
      shortcutId: null,
      text: '配置维护',
      url: 'sys/sys_profile.html',
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'CODE_RULE_REACT',
      icon: 'airline_seat_flat-o',
      id: 90,
      ischecked: true,
      score: 60,
      shortcutId: null,
      text: '编码规则(react)',
      url: 'hap-core/sys/code_rules',
      symbol: '1',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'EMAIL',
      icon: 'airline_seat_flat-o',
      id: 19,
      ischecked: true,
      score: 80,
      shortcutId: null,
      text: '邮件',
      url: null,
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'FLEX_FIELD',
      icon: 'airline_seat_flat-o',
      id: 79,
      ischecked: true,
      score: 90,
      shortcutId: null,
      text: '弹性域',
      url: null,
      symbol: '0',
      parentId: 1,
    },
    {
      expand: false,
      functionCode: 'DATA_PERMISSION',
      icon: 'airline_seat_flat-o',
      id: 84,
      ischecked: false,
      score: 100,
      shortcutId: null,
      text: '数据屏蔽',
      url: null,
      symbol: '0',
      parentId: 1,
    },
  ],
  success: true,
};
const asyncTreeMock2 = {
  rows: [
    {
      expand: false,
      functionCode: 'EMPLOYEE_REACT',
      icon: 'airline_seat_flat-o',
      id: 7,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '员工管理(react)',
      url: 'hap-core/hr/employee',
      symbol: '1',
      parentId: 2,
    },
    {
      expand: false,
      functionCode: 'HR_UNIT',
      icon: 'airline_seat_flat_angled-o',
      id: 73,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '组织管理',
      url: 'hr/org_unit.html',
      symbol: '0',
      parentId: 2,
    },
    {
      expand: false,
      functionCode: 'COMPANY_REACT',
      icon: 'airline_seat_flat-o',
      id: 12,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '公司管理(react)',
      url: 'hap-core/hr/company',
      symbol: '1',
      parentId: 2,
    },
    {
      expand: false,
      functionCode: 'ORGUNIT_REACT',
      icon: 'airline_seat_flat_angled-o',
      id: 5,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '组织管理(react)',
      url: 'hap-core/hr/orgunit',
      symbol: '1',
      parentId: 2,
    },
    {
      expand: false,
      functionCode: 'POSITION_REACT',
      icon: 'airline_seat_flat-o',
      id: 6,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '岗位管理(react)',
      url: 'hap-core/hr/position',
      symbol: '1',
      parentId: 2,
    },
    {
      expand: false,
      functionCode: 'HR_POSITION',
      icon: 'airline_seat_flat-o',
      id: 75,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '岗位管理',
      url: 'hr/position.html',
      symbol: '0',
      parentId: 2,
    },
    {
      expand: false,
      functionCode: 'HR_EMPLOYEE',
      icon: 'airline_seat_flat-o',
      id: 74,
      ischecked: true,
      score: 30,
      shortcutId: null,
      text: '员工管理',
      url: 'hr/employee.html',
      symbol: '0',
      parentId: 2,
    },
    {
      expand: false,
      functionCode: 'FND_COMPANY',
      icon: 'airline_seat_flat-o',
      id: 76,
      ischecked: null,
      score: 40,
      shortcutId: null,
      text: '公司管理',
      url: 'fnd/company.html',
      symbol: '0',
      parentId: 2,
    },
  ],
  success: true,
};
const asyncTreeMock3 = {
  rows: [
    {
      expand: false,
      functionCode: 'FUNCTION_ADD',
      icon: 'airline_seat_flat-o',
      id: 66,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '功能维护',
      url: 'sys/sys_function.html',
      symbol: '0',
      parentId: 3,
    },
    {
      expand: false,
      functionCode: 'RESOYRCE_REACT',
      icon: 'airline_seat_flat-o',
      id: 11,
      ischecked: null,
      score: 10,
      shortcutId: null,
      text: '资源管理(react)',
      url: 'hap-core/sys/resource',
      symbol: '1',
      parentId: 3,
    },
    {
      expand: false,
      functionCode: 'FUNCTION_REACT',
      icon: 'airline_seat_flat-o',
      id: 13,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '功能维护(react)',
      url: 'hap-core/sys/function',
      symbol: '1',
      parentId: 3,
    },
    {
      expand: false,
      functionCode: 'SYS_RESOURCE',
      icon: 'airline_seat_flat-o',
      id: 67,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '资源管理',
      url: 'sys/sys_resource.html',
      symbol: '0',
      parentId: 3,
    },
    {
      expand: false,
      functionCode: 'FUNCTION_ASSIGN',
      icon: 'airline_seat_flat-o',
      id: 68,
      ischecked: true,
      score: 90,
      shortcutId: null,
      text: '功能分配',
      url: 'sys/sys_role_function.html',
      symbol: '0',
      parentId: 3,
    },
  ],
  success: true,
};
const asyncTreeMock8 = {
  rows: [
    {
      expand: false,
      functionCode: 'ACCOUNT_USER',
      icon: 'airline_seat_flat-o',
      id: 64,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '用户管理',
      url: 'sys/sys_user.html',
      symbol: '0',
      parentId: 8,
    },
    {
      expand: false,
      functionCode: 'ACCOUNT_USER_REACT',
      icon: 'airline_seat_flat-o',
      id: 9,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '用户管理(react)',
      url: 'hap-core/account/user',
      symbol: '1',
      parentId: 8,
    },
    {
      expand: false,
      functionCode: 'ACCOUNT_ROLE_REACT',
      icon: 'airline_seat_flat-o',
      id: 10,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '角色管理(react)',
      url: 'hap-core/account/role',
      symbol: '1',
      parentId: 8,
    },
    {
      expand: false,
      functionCode: 'ACCOUNT_ROLE',
      icon: 'airline_seat_flat-o',
      id: 65,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '角色管理',
      url: 'sys/sys_role.html',
      symbol: '0',
      parentId: 8,
    },
  ],
  success: true,
};
const asyncTreeMock16 = {
  rows: [
    {
      expand: false,
      functionCode: 'JOB_DETAIL',
      icon: 'airline_seat_flat-o',
      id: 17,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '任务明细',
      url: 'job/job_detail.html',
      symbol: '0',
      parentId: 16,
    },
    {
      expand: false,
      functionCode: 'JOB_RUNNING_INFO',
      icon: 'airline_seat_flat-o',
      id: 18,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '执行记录',
      url: 'job/job_running_info.html',
      symbol: '0',
      parentId: 16,
    },
  ],
  success: true,
};
const asyncTreeMock19 = {
  rows: [
    {
      expand: false,
      functionCode: 'EMAIL_ACCOUNT',
      icon: 'airline_seat_flat-o',
      id: 20,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '邮件账户',
      url: 'mail/sys_message_email_config.html',
      symbol: '0',
      parentId: 19,
    },
    {
      expand: false,
      functionCode: 'EMAIL_TEMPLATE',
      icon: 'airline_seat_flat-o',
      id: 21,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '邮件模板',
      url: 'mail/sys_message_template.html',
      symbol: '0',
      parentId: 19,
    },
    {
      expand: false,
      functionCode: 'EMAIL_TEST',
      icon: 'airline_seat_flat-o',
      id: 22,
      ischecked: true,
      score: 30,
      shortcutId: null,
      text: '邮件测试',
      url: 'mail/sys_message_test.html',
      symbol: '0',
      parentId: 19,
    },
    {
      expand: false,
      functionCode: 'EMAIL_STATUS',
      icon: 'airline_seat_flat-o',
      id: 23,
      ischecked: true,
      score: 40,
      shortcutId: null,
      text: '邮件状态查询',
      url: 'mail/message_status.html',
      symbol: '0',
      parentId: 19,
    },
  ],
  success: true,
};
const asyncTreeMock24 = {
  rows: [
    {
      expand: false,
      functionCode: 'SYS_REPORT_LIST',
      icon: 'airline_seat_flat-o',
      id: 25,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '报表定义',
      url: 'rpt/report.html',
      symbol: '0',
      parentId: 24,
    },
    {
      expand: false,
      functionCode: 'SYS_REPORT_DESIGN',
      icon: 'airline_seat_flat-o',
      id: 26,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '报表设计',
      url: 'ureport/designer',
      symbol: '0',
      parentId: 24,
    },
  ],
  success: true,
};
const asyncTreeMock27 = {
  rows: [

    {
      expand: false,
      functionCode: 'WFL_TEST',
      icon: 'airline_seat_flat-o',
      id: 30,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '工作流测试',
      url: 'activiti/start_process_test.html',
      symbol: '0',
      parentId: 27,
    },
    {
      expand: false,
      functionCode: 'WFL_VACATION_TEST',
      icon: 'airline_seat_flat-o',
      id: 38,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '工作流测试(请假申请)',
      url: 'activiti/demo/vacation_list.html',
      symbol: '0',
      parentId: 27,
    },
    {
      expand: false,
      functionCode: 'WFL_TASK',
      icon: 'airline_seat_flat-o',
      id: 28,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '待办事项(管理员)',
      url: 'activiti/task_list.html',
      symbol: '0',
      parentId: 27,
    },
    {
      expand: false,
      functionCode: 'WFL_MODEL',
      icon: 'airline_seat_flat-o',
      id: 29,
      ischecked: true,
      score: 40,
      shortcutId: null,
      text: '流程设计',
      url: 'activiti/models.html',
      symbol: '0',
      parentId: 27,
    },
    {
      expand: false,
      functionCode: 'WFL_DEFINITION',
      icon: 'airline_seat_flat-o',
      id: 31,
      ischecked: true,
      score: 50,
      shortcutId: null,
      text: '流程部署',
      url: 'activiti/process_definitions.html',
      symbol: '0',
      parentId: 27,
    },
    {
      expand: false,
      functionCode: 'WFL_LOG',
      icon: 'airline_seat_flat-o',
      id: 33,
      ischecked: true,
      score: 60,
      shortcutId: null,
      text: '报错日志',
      url: 'activiti/execption.html',
      symbol: '0',
      parentId: 27,
    },
    {
      expand: false,
      functionCode: 'WFL_MONITOR',
      icon: 'airline_seat_flat-o',
      id: 32,
      ischecked: true,
      score: 60,
      shortcutId: null,
      text: '流程监控',
      url: 'activiti/process_monitor.html',
      symbol: '0',
      parentId: 27,
    },
    {
      expand: false,
      functionCode: 'WFL_APPROVE',
      icon: 'airline_seat_flat-o',
      id: 34,
      ischecked: true,
      score: 90,
      shortcutId: null,
      text: '审批配置',
      url: null,
      symbol: '0',
      parentId: 27,
    },
  ],
  success: true,
};
const asyncTreeMock34 = {
  rows: [
    {
      expand: false,
      functionCode: 'WFL_APV_STRATEGY',
      icon: 'airline_seat_flat-o',
      id: 35,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '审批方式',
      url: 'activiti/approval/approve_strategy.html',
      symbol: '0',
      parentId: 34,
    },
    {
      expand: false,
      functionCode: 'WFL_APV_TYPE',
      icon: 'airline_seat_flat-o',
      id: 36,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '审批规则',
      url: 'activiti/approval/approve_candidate_rule.html',
      symbol: '0',
      parentId: 34,
    },
    {
      expand: false,
      functionCode: 'WFL_APV_RULE',
      icon: 'airline_seat_flat-o',
      id: 37,
      ischecked: true,
      score: 30,
      shortcutId: null,
      text: '审批权限',
      url: 'activiti/approval/business_rule_header.html',
      symbol: '0',
      parentId: 34,
    },
  ],
  success: true,
};
const asyncTreeMock39 = {
  rows: [
    {
      expand: false,
      functionCode: 'WFL_AUTO_DELEGATE',
      icon: 'airline_seat_flat-o',
      id: 44,
      ischecked: true,
      score: 5,
      shortcutId: null,
      text: '自动转交配置',
      url: 'activiti/auto_delegate_config.html',
      symbol: '0',
      parentId: 39,
    },
    {
      expand: false,
      functionCode: 'WFL_MY_START',
      icon: 'airline_seat_flat-o',
      id: 41,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '我发起的流程',
      url: 'wfl/activiti/process_history_start.html',
      symbol: '0',
      parentId: 39,
    },
    {
      expand: false,
      functionCode: 'WFL_MY_TASK',
      icon: 'airline_seat_flat-o',
      id: 42,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '我的待办列表',
      url: 'activiti/my_task.html',
      symbol: '0',
      parentId: 39,
    },
    {
      expand: false,
      functionCode: 'WFL_HISROTY',
      icon: 'airline_seat_flat-o',
      id: 43,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '我参与的流程',
      url: 'activiti/process_history.html',
      symbol: '0',
      parentId: 39,
    },
    {
      expand: false,
      functionCode: 'WFL_CARBON',
      icon: 'airline_seat_flat-o',
      id: 40,
      ischecked: true,
      score: 30,
      shortcutId: null,
      text: '我的抄送流程',
      url: 'wfl/activiti/process_history_carbon.html',
      symbol: '0',
      parentId: 39,
    },
  ],
  success: true,
};
const asyncTreeMock45 = {
  rows: [
    {
      expand: false,
      functionCode: 'IF_CONFIG',
      icon: 'airline_seat_flat-o',
      id: 46,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '接口定义',
      url: 'intergration/sys_interface_header.html',
      symbol: '0',
      parentId: 45,
    },
    {
      expand: false,
      functionCode: 'IF_INVOKE',
      icon: 'airline_seat_flat-o',
      id: 89,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '调用记录',
      url: 'intergration/sys_interface_invoke.html',
      symbol: '0',
      parentId: 45,
    },
    {
      expand: false,
      functionCode: 'IF_CLIENT',
      icon: 'airline_seat_flat-o',
      id: 47,
      ischecked: true,
      score: 30,
      shortcutId: null,
      text: '客户端管理',
      url: 'sys/sys_oauth_client_details.html',
      symbol: '0',
      parentId: 45,
    },
    {
      expand: false,
      functionCode: 'IF_TOKEN',
      icon: 'airline_seat_flat-o',
      id: 48,
      ischecked: true,
      score: 40,
      shortcutId: null,
      text: '授权管理',
      url: 'sys/sys_token_logs.html',
      symbol: '0',
      parentId: 45,
    },
  ],
  success: true,
};
const asyncTreeMock49 = {
  rows: [
    {
      expand: false,
      functionCode: 'API_SERVER',
      icon: 'airline_seat_flat-o',
      id: 50,
      ischecked: true,
      score: 5,
      shortcutId: null,
      text: '服务注册',
      url: 'gateway/api_server.html',
      symbol: '0',
      parentId: 49,
    },
    {
      expand: false,
      functionCode: 'API_APPLICATION',
      icon: 'airline_seat_flat-o',
      id: 51,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '应用管理',
      url: 'gateway/api_application.html',
      symbol: '0',
      parentId: 49,
    },
    {
      expand: false,
      functionCode: 'API_INVOKE',
      icon: 'airline_seat_flat-o',
      id: 52,
      ischecked: true,
      score: 15,
      shortcutId: null,
      text: '调用记录',
      url: 'gateway/api_invoke_record.html',
      symbol: '0',
      parentId: 49,
    },
  ],
  success: true,
};
const asyncTreeMock53 = {
  rows: [
    {
      expand: false,
      functionCode: 'TASK_DETAIL',
      icon: 'airline_seat_flat-o',
      id: 54,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '任务管理',
      url: 'task/task_details.html',
      symbol: '0',
      parentId: 53,
    },
    {
      expand: false,
      functionCode: 'TASK_EXECUTE',
      icon: 'airline_seat_flat-o',
      id: 55,
      ischecked: true,
      score: 15,
      shortcutId: null,
      text: '任务执行',
      url: 'task/task_execute.html',
      symbol: '0',
      parentId: 53,
    },
    {
      expand: false,
      functionCode: 'TASK_EXECUTION',
      icon: 'airline_seat_flat-o',
      id: 56,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '执行记录',
      url: 'task/task_execution.html',
      symbol: '0',
      parentId: 53,
    },
    {
      expand: false,
      functionCode: 'TASK_ADMIN_EXECUTION',
      icon: 'airline_seat_flat-o',
      id: 57,
      ischecked: true,
      score: 25,
      shortcutId: null,
      text: '执行记录(管理员)',
      url: 'sys/task/execution/admin/task_execution.html',
      symbol: '0',
      parentId: 53,
    },
  ],
  success: true,
};
const asyncTreeMock69 = {
  rows: [
    {
      expand: false,
      functionCode: 'ATTACH_CATEGORY',
      icon: 'airline_seat_flat-o',
      id: 72,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '目录管理',
      url: 'attach/sys_attach_category_manage.html',
      symbol: '0',
      parentId: 69,
    },
    {
      expand: false,
      functionCode: 'ATTACH_FILE',
      icon: 'airline_seat_flat-o',
      id: 70,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '文件管理',
      url: 'attach/sys_file_manage.html',
      symbol: '0',
      parentId: 69,
    },
    {
      expand: false,
      functionCode: 'ATTACH_TEST',
      icon: 'airline_seat_flat-o',
      id: 71,
      ischecked: true,
      score: 30,
      shortcutId: null,
      text: '上传测试',
      url: 'attach/sys_attachment_create.html',
      symbol: '0',
      parentId: 69,
    },
  ],
  success: true,
};
const asyncTreeMock79 = {
  rows: [
    {
      expand: false,
      functionCode: 'FLEX_FIELD_MODEL',
      icon: 'airline_seat_flat-o',
      id: 80,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '弹性域模型',
      url: 'flexfield/flex_model.html',
      symbol: '0',
      parentId: 79,
    },
    {
      expand: false,
      functionCode: 'FLEX_FIELD_RULE_SET',
      icon: 'airline_seat_flat-o',
      id: 81,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '弹性域规则',
      url: 'flexfield/flex_rule_set.html',
      symbol: '0',
      parentId: 79,
    },
    {
      expand: false,
      functionCode: 'FLEX_FIELD_DEMO',
      icon: 'airline_seat_flat-o',
      id: 82,
      ischecked: true,
      score: 30,
      shortcutId: null,
      text: '弹性域示例',
      url: 'demo/flexfield.html',
      symbol: '0',
      parentId: 79,
    },
  ],
  success: true,
};
const asyncTreeMock84 = {
  rows: [
    {
      expand: false,
      functionCode: 'DATA_PERMISSION_RULE',
      icon: 'airline_seat_flat-o',
      id: 85,
      ischecked: true,
      score: 10,
      shortcutId: null,
      text: '屏蔽规则管理',
      url: 'permission/data_permission_rule.html',
      symbol: '0',
      parentId: 84,
    },
    {
      expand: false,
      functionCode: 'DATA_PERMISSION_TABLE',
      icon: 'airline_seat_flat-o',
      id: 86,
      ischecked: true,
      score: 20,
      shortcutId: null,
      text: '屏蔽权限设置',
      url: 'permission/data_permission_table.html',
      symbol: '0',
      parentId: 84,
    },
  ],
  success: true,
};
const lessTreeMock = {
  rows: [
    ...lessTreeMockRootRows,
    ...asyncTreeMock2.rows,
    ...asyncTreeMock24.rows,
  ],
  success: true,
};

const mockTemple = {
  rows: [
    ...asyncTreeMock.rows,
    ...asyncTreeMock1.rows,
    ...asyncTreeMock2.rows,
    ...asyncTreeMock3.rows,
    ...asyncTreeMock8.rows,
    ...asyncTreeMock16.rows,
    ...asyncTreeMock19.rows,
    ...asyncTreeMock24.rows,
    ...asyncTreeMock27.rows,
    ...asyncTreeMock34.rows,
    ...asyncTreeMock39.rows,
    ...asyncTreeMock45.rows,
    ...asyncTreeMock49.rows,
    ...asyncTreeMock53.rows,
    ...asyncTreeMock69.rows,
    ...asyncTreeMock79.rows,
    ...asyncTreeMock84.rows,
  ],
  success: true,
};

const treeRule = /\/tree.mock/;
const lessTreeRule = /\/tree-less.mock/;
const asyncRule = /\/tree-async.mock/;
const asyncRuleSize5Page1 = /\/tree-async\/5\/1.mock/;
const asyncRuleSize5Page2 = /\/tree-async\/5\/2.mock/;
const asyncRuleSize10Page1 = /\/tree-async\/10\/1.mock/;
const asyncRuleSize50Page1 = /\/tree-async\/50\/1.mock/;
const asyncRuleSize100Page1 = /\/tree-async\/100\/1.mock/;
const asyncRule1 = /\/tree-async-1.mock/;
const asyncRule2 = /\/tree-async-2.mock/;
const asyncRule3 = /\/tree-async-3.mock/;
const asyncRule8 = /\/tree-async-8.mock/;
const asyncRule16 = /\/tree-async-16.mock/;
const asyncRule19 = /\/tree-async-19.mock/;
const asyncRule24 = /\/tree-async-24.mock/;
const asyncRule27 = /\/tree-async-27.mock/;
const asyncRule34 = /\/tree-async-34.mock/;
const asyncRule39 = /\/tree-async-39.mock/;
const asyncRule45 = /\/tree-async-45.mock/;
const asyncRule49 = /\/tree-async-49.mock/;
const asyncRule53 = /\/tree-async-53.mock/;
const asyncRule69 = /\/tree-async-69.mock/;
const asyncRule79 = /\/tree-async-79.mock/;
const asyncRule84 = /\/tree-async-84.mock/;
const asyncRuleEmpty = /\/tree-async-\d+.mock/;

const treeData = Mock.mock(mockTemple);
const lessTreeData = Mock.mock(lessTreeMock);
export default function () {
  if (typeof window !== 'undefined') {
    Mock.mock(treeRule, mockTemple);
    Mock.mock(lessTreeRule, lessTreeMock);
    Mock.mock(asyncRule, asyncTreeMock);
    Mock.mock(asyncRuleSize5Page1, asyncTreeMockSize5Page1);
    Mock.mock(asyncRuleSize5Page2, asyncTreeMockSize5Page2);
    Mock.mock(asyncRuleSize10Page1, asyncTreeMock);
    Mock.mock(asyncRuleSize50Page1, asyncTreeMock);
    Mock.mock(asyncRuleSize100Page1, asyncTreeMock);
    Mock.mock(asyncRule1, asyncTreeMock1);
    Mock.mock(asyncRule2, asyncTreeMock2);
    Mock.mock(asyncRule3, asyncTreeMock3);
    Mock.mock(asyncRule8, asyncTreeMock8);
    Mock.mock(asyncRule16, asyncTreeMock16);
    Mock.mock(asyncRule19, asyncTreeMock19);
    Mock.mock(asyncRule24, asyncTreeMock24);
    Mock.mock(asyncRule27, asyncTreeMock27);
    Mock.mock(asyncRule34, asyncTreeMock34);
    Mock.mock(asyncRule39, asyncTreeMock39);
    Mock.mock(asyncRule45, asyncTreeMock45);
    Mock.mock(asyncRule49, asyncTreeMock49);
    Mock.mock(asyncRule53, asyncTreeMock53);
    Mock.mock(asyncRule69, asyncTreeMock69);
    Mock.mock(asyncRule79, asyncTreeMock79);
    Mock.mock(asyncRule84, asyncTreeMock84);
    Mock.mock(asyncRuleEmpty, asyncTreeMockEmpty);
  }
}
export const treeMockTemple = mockTemple;
export const treeTempList = [{ rule: treeRule, data: treeData }, { rule: lessTreeRule, data: lessTreeData }, {
  rule: asyncRule,
  data: asyncTreeMock,
}];