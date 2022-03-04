---
order: 4
title:
  zh-CN: 查询模式 - 确定类目
  en-US: Lookup-Patterns - Certain Category
---

## zh-CN

[查询模式: 确定类目](/docs/spec/reaction#Lookup-Patterns) 示例。

## en-US

Demonstration of [Lookup Patterns: Certain Category](/docs/spec/reaction#Lookup-Patterns).
Basic Usage, set datasource of autocomplete with `dataSource` property.

````jsx
import { Button, Input, AutoComplete } from 'choerodon-ui';

const Option = AutoComplete.Option;
const OptGroup = AutoComplete.OptGroup;

const dataSource = [{
  title: '话题',
  children: [{
    title: 'Choerodon',
    count: 10000,
  }, {
    title: 'Choerodon UI',
    count: 10600,
  }],
}, {
  title: '问题',
  children: [{
    title: 'Choerodon UI 有多好',
    count: 60100,
  }, {
    title: 'Choerodon 是啥',
    count: 30010,
  }],
}, {
  title: '文章',
  children: [{
    title: 'Choerodon UI 是一个设计语言',
    count: 100000,
  }],
}];

function renderTitle(title) {
  return (
    <span>
      {title}
      <a
        style={{ float: 'right' }}
        href="https://www.google.com/search?q=choerodon"
        target="_blank"
        rel="noopener noreferrer"
      >更多
      </a>
    </span>
  );
}

const options = dataSource.map(group => (
  <OptGroup
    key={group.title}
    label={renderTitle(group.title)}
  >
    {group.children.map(opt => (
      <Option key={opt.title} value={opt.title}>
        {opt.title}
        <span className="certain-search-item-count">{opt.count} 人 关注</span>
      </Option>
    ))}
  </OptGroup>
)).concat([
  <Option disabled key="all" className="show-all">
    <a
      href="https://www.google.com/search?q=choerodon"
      target="_blank"
      rel="noopener noreferrer"
    >
      查看所有结果
    </a>
  </Option>,
]);

function Complete() {
  return (
    <div className="certain-category-search-wrapper" style={{ width: 250 }}>
      <AutoComplete
        className="certain-category-search"
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 300 }}
        style={{ width: '100%' }}
        dataSource={options}
        placeholder="input here"
        optionLabelProp="value"
      >
        <Input suffix={<Button shape="circle" size="small" funcType="flat" icon="search" />} />
      </AutoComplete>
    </div>
  );
}

ReactDOM.render(<Complete />, mountNode);
````

````css
.certain-category-search.c7n-select-auto-complete .c7n-input-affix-wrapper .c7n-input-suffix {
  right: 12px;
}

.certain-category-search-dropdown .c7n-select-dropdown-menu-item-group-title {
  color: #666;
  font-weight: bold;
}

.certain-category-search-dropdown .c7n-select-dropdown-menu-item-group {
  border-bottom: 1px solid #F6F6F6;
}

.certain-category-search-dropdown .c7n-select-dropdown-menu-item {
  padding-left: 16px;
}

.certain-category-search-dropdown .c7n-select-dropdown-menu-item.show-all {
  text-align: center;
  cursor: default;
}

.certain-category-search-dropdown .c7n-select-dropdown-menu {
  max-height: 300px;
}

.certain-search-item-count {
 position: absolute;
 color: #999;
 right: 16px;
}

.certain-category-search.c7n-select-focused .certain-category-icon {
  color: #108ee9;
}

.certain-category-icon {
  color: #6E6E6E;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  font-size: 16px;
}
````
