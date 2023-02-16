// /**
//  * 后端传过来的组件类型
//  * @type {{DATE: string, NUMBER: string, LOV: string, DATETIME: string, LOOKUP: string, STRING: string, BOOLEAN: string}}
//  */
// export const COMPONENT_TYPE = {
//   STRING: 'string',
//   BOOLEAN: 'boolean',
//   NUMBER: 'number',
//   DATE: 'date',
//   TIME: 'time',
//   DATETIME: 'datetime',
//   LOV: 'lov',
//   LOOKUP: 'lookup',
// };

import { $l } from '../../../locale-context';

/**
 * 比较符
 * @type {{}}
 */
export const OPERATOR = {
  EQUAL: { value: 'EQUAL', meaning: $l('Operator', 'equal') },
  NOT_EQUAL: { value: 'NOT_EQUAL', meaning: $l('Operator', 'not_equal') },
  // BETWEEN: { value: 'BETWEEN', meaning: '介于' },
  GREATER_THAN: { value: 'GREATER_THAN', meaning: $l('Operator', 'greater_than') },
  GREATER_THAN_OR_EQUAL_TO: { value: 'GREATER_THAN_OR_EQUAL_TO', meaning: $l('Operator', 'greater_than_or_equal_to') },
  LESS_THAN: { value: 'LESS_THAN', meaning: $l('Operator', 'less_than') },
  LESS_THAN_OR_EQUAL_TO: { value: 'LESS_THAN_OR_EQUAL_TO', meaning: $l('Operator', 'less_than_or_equal_to') },
  IN: { value: 'IN', meaning: $l('Operator', 'in') },
  NOT_IN: { value: 'NOT_IN', meaning: $l('Operator', 'not_in') },
  IS_NULL: { value: 'IS_NULL', meaning: $l('Operator', 'is_null') },
  IS_NOT_NULL: { value: 'IS_NOT_NULL', meaning: $l('Operator', 'is_not_null') },
  // START_WITH: { value: 'START_WITH', meaning: '以此开始' },
  // NOT_START_WITH: { value: 'NOT_START_WITH', meaning: '不以此开始' },
  // END_WITH: { value: 'END_WITH', meaning: '以此结束' },
  // NOT_END_WITH: { value: 'NOT_END_WITH', meaning: '不以此结束' },
  // LIKE: { value: 'LIKE', meaning: '相似于' },
  // NOT_LIKE: { value: 'NOT_LIKE', meaning: '不相似于' },
  FULLY_FUZZY: { value: 'FULLY_FUZZY', meaning: $l('Operator', 'fully_fuzzy') },
  AFTER_FUZZY: { value: 'AFTER_FUZZY', meaning: $l('Operator', 'after_fuzzy') },
  BEFORE_FUZZY: { value: 'BEFORE_FUZZY', meaning: $l('Operator', 'before_fuzzy') },
  RANGE: { value: 'RANGE', meaning: $l('Operator', 'range') },
};

/**
 * 操作列表
 * @type {{DATE: *[], NUMBER: *[], LOV: *[], DATETIME: *[], LOOKUP: *[], STRING: *[], BOOLEAN: *[]}}
 */
export const OPERATOR_TYPE = {
  // 等于、不等于、相似于、不相似于、空、非空
  // 多选：包含于、不包含于、空、非空
  STRING: [
    OPERATOR.EQUAL,
    OPERATOR.NOT_EQUAL,
    OPERATOR.FULLY_FUZZY,
    // OPERATOR.LIKE,
    // OPERATOR.NOT_LIKE,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
  ],
  // 等于、不等于、相似于、不相似于、空、非空
  // 多选：包含于、不包含于、空、非空
  INTL: [
    OPERATOR.EQUAL,
    OPERATOR.NOT_EQUAL,
    OPERATOR.FULLY_FUZZY,
    // OPERATOR.LIKE,
    // OPERATOR.NOT_LIKE,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
  ],
  // 等于、不等于
  BOOLEAN: [OPERATOR.EQUAL, OPERATOR.NOT_EQUAL],
  // 等于、不等于、大于、大于等于、小于、小于等于、空、非空
  NUMBER: [
    OPERATOR.EQUAL,
    OPERATOR.NOT_EQUAL,
    OPERATOR.GREATER_THAN,
    OPERATOR.GREATER_THAN_OR_EQUAL_TO,
    OPERATOR.LESS_THAN,
    OPERATOR.LESS_THAN_OR_EQUAL_TO,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
  ],
  // 等于、介于、大于、大于等于、小于、小于等于、空、非空
  DATE: [
    OPERATOR.EQUAL,
    // OPERATOR.BETWEEN,
    OPERATOR.RANGE,
    OPERATOR.GREATER_THAN,
    OPERATOR.GREATER_THAN_OR_EQUAL_TO,
    OPERATOR.LESS_THAN,
    OPERATOR.LESS_THAN_OR_EQUAL_TO,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
  ],
  // 等于、介于、大于、大于等于、小于、小于等于、空、非空
  YEAR: [
    OPERATOR.EQUAL,
    // OPERATOR.BETWEEN,
    OPERATOR.RANGE,
    OPERATOR.GREATER_THAN,
    OPERATOR.GREATER_THAN_OR_EQUAL_TO,
    OPERATOR.LESS_THAN,
    OPERATOR.LESS_THAN_OR_EQUAL_TO,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
  ],
  // 等于、介于、大于、大于等于、小于、小于等于、空、非空
  MONTH: [
    OPERATOR.EQUAL,
    // OPERATOR.BETWEEN,
    OPERATOR.RANGE,
    OPERATOR.GREATER_THAN,
    OPERATOR.GREATER_THAN_OR_EQUAL_TO,
    OPERATOR.LESS_THAN,
    OPERATOR.LESS_THAN_OR_EQUAL_TO,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
  ],
  // 等于、介于、大于、大于等于、小于、小于等于、空、非空
  WEEK: [
    OPERATOR.EQUAL,
    // OPERATOR.BETWEEN,
    OPERATOR.RANGE,
    OPERATOR.GREATER_THAN,
    OPERATOR.GREATER_THAN_OR_EQUAL_TO,
    OPERATOR.LESS_THAN,
    OPERATOR.LESS_THAN_OR_EQUAL_TO,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
  ],
  // 等于、大于、大于等于、小于、小于等于、空、非空
  TIME: [
    OPERATOR.EQUAL,
    OPERATOR.GREATER_THAN,
    OPERATOR.GREATER_THAN_OR_EQUAL_TO,
    OPERATOR.LESS_THAN,
    OPERATOR.LESS_THAN_OR_EQUAL_TO,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
  ],
  // 等于、介于、大于、大于等于、小于、小于等于、空、非空
  DATETIME: [
    OPERATOR.EQUAL,
    // OPERATOR.BETWEEN,
    OPERATOR.RANGE,
    OPERATOR.GREATER_THAN,
    OPERATOR.GREATER_THAN_OR_EQUAL_TO,
    OPERATOR.LESS_THAN,
    OPERATOR.LESS_THAN_OR_EQUAL_TO,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
  ],
  // 等于、不等于、空、非空
  // 多选：包含于、不包含于、空、非空
  LOV: [OPERATOR.EQUAL, OPERATOR.NOT_EQUAL, OPERATOR.IS_NULL, OPERATOR.IS_NOT_NULL],
  // 等于、不等于、空、非空
  // 多选：包含于、不包含于、空、非空
  LOOKUP: [OPERATOR.EQUAL, OPERATOR.NOT_EQUAL, OPERATOR.IS_NULL, OPERATOR.IS_NOT_NULL],
  ALL: [
    OPERATOR.EQUAL,
    OPERATOR.NOT_EQUAL,
    // OPERATOR.BETWEEN,
    OPERATOR.GREATER_THAN,
    OPERATOR.GREATER_THAN_OR_EQUAL_TO,
    OPERATOR.LESS_THAN,
    OPERATOR.LESS_THAN_OR_EQUAL_TO,
    OPERATOR.IN,
    OPERATOR.NOT_IN,
    OPERATOR.IS_NULL,
    OPERATOR.IS_NOT_NULL,
    OPERATOR.AFTER_FUZZY,
    // OPERATOR.START_WITH,
    // OPERATOR.NOT_START_WITH,
    OPERATOR.BEFORE_FUZZY,
    // OPERATOR.END_WITH,
    // OPERATOR.NOT_END_WITH,
    OPERATOR.FULLY_FUZZY,
    // OPERATOR.LIKE,
    // OPERATOR.NOT_LIKE,
  ],
};
