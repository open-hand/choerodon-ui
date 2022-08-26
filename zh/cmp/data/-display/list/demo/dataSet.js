import React from 'react';
import ReactDOM from 'react-dom';
import { List, Avatar } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoQuery: true,
    name: 'user',
    primaryKey: 'name',
    pageSize: 5,
    events: {
      select: ({ dataSet, record, previous }) => {
        console.log('select', { dataSet, record, previous });
      },
      unSelect: ({ dataSet, record, previous }) => {
        console.log('unSelect', { dataSet, record, previous });
      },
    },
  });

  render() {
    return (
      <List
        dataSet={this.ds}
        rowKey="name"
        renderItem={({ record }) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar>Choerodon</Avatar>}
              title={
                <a href="https://choerodon.github.io/choerodon-ui/">
                  {record.get('name')}
                </a>
              }
              description="Choerodon"
            />
          </List.Item>
        )}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
