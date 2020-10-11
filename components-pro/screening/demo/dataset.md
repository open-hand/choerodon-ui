---
order: 0
title: 
  zh-CN: 绑定数据源
  en-US: DataSet Binding
---

## zh-CN

绑定数据源。

## en-US

DataSet Binding.

````jsx
import { Screening, DataSet } from 'choerodon-ui/pro';

const ScreeningItem = Screening.ScreeningItem

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.toData(),
  );
}

function handQueryDataSet({ dataSet, params, data }){
  console.log(data);
}




class App extends React.Component {

  ds = new DataSet({
    autoCreate: true,
    data:[{wear5: ["kidsOverSize", "thermalUnderWear"]}],
    fields: [
      { name: 'wear0', type: 'object', lookupCode: 'WEAR',label:'衣服分类0' },
      { name: 'wear1', type: 'string', lookupCode: 'WEAR',label:'衣服分类1' },
      { name: 'wear2', type: 'string', lookupCode: 'WEAR',label:'衣服分类2' },
      { name: 'wear3', type: 'string', lookupCode: 'WEAR',label:'衣服分类3' },
      { name: 'wear4', type: 'string', lookupCode: 'WEAR',label:'衣服分类4' },
      { name: 'wear5', type: 'string', lookupCode: 'WEAR',label:'衣服分类5' },
    ],
    events: { 
      update: handleDataSetChange,
      query: handQueryDataSet,
    },
  });

  render() {
    return (
      <Screening dataSet={this.ds} >
        <ScreeningItem name='wear0' />
        <ScreeningItem optionRenderer={({text,value,record}) => (`${text}-精品`)} colProps={{span:8}} name='wear1' />
        <ScreeningItem name='wear2' />
        <ScreeningItem colProps={{span:12}} name='wear3' />
        <ScreeningItem name='wear4' />
        <ScreeningItem name='wear5' />
      </Screening>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
