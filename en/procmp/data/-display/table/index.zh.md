---
title: Table
subtitle: 表格
order: 0
---

展示行列数据，导出和分页配置参见底部。

## 何时使用

当需要对数据进行排序、搜索、分页、自定义操作等复杂行为时。

> 相关教程：[Table](/zh/tutorials/table-advance)

**注意事项**

> Pro Table 功能集成多，逻辑复杂，因此需要单页展示大量数据时，在开发技术选型前一定要注意考量。

**大数据量场景参考：**

参考[功能总和 demo](#功能总和)，在此复杂度下单页展示 1000 条（2w+ 单元格），加载耗时超过 10s，约 12s 左右。


**处理方案** 

> 根据具体场景及需求建议加载耗时 10s 以上改用大数据表格 [PerformanceTable](/zh/procmp/data-display/performance-table) 或参考[虚拟滚动 demo](#虚拟滚动) 处理。
