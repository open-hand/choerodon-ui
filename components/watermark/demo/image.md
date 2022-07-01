---
order: 1
title:
  zh-CN: 图片水印
  en-US: Image
---

## zh-CN

显示图片的水印

## en-US

Show Image of watermark

````jsx
import React from 'react';
import { WaterMark } from 'choerodon-ui';

ReactDOM.render(
  <WaterMark
    height={36}
    width={200}
    image="/1bf6a5fa3f014f7d70d24574cfac2e36.svg"
    opacity={0.2}
  >
    <div style={{ height: 500 }}>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quisquam aliquid perferendis,
        adipisci dolorum officia odio natus facere cumque iusto libero repellendus praesentium
        ipsa cupiditate iure autem eos repudiandae delectus totam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo praesentium, aperiam numquam
        voluptatibus asperiores odio? Doloribus saepe, eligendi facere inventore culpa,
        exercitationem explicabo earum laborum deleniti reiciendis deserunt accusantium ullam.
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia voluptas numquam impedit
        architecto facilis aliquam at assumenda, nostrum explicabo accusantium ipsam error
        provident voluptate molestias magnam quisquam excepturi illum sit!
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam, accusantium quo corporis
        fugit possimus quaerat ad consequatur veniam voluptatum ut cumque illo beatae. Magni
        assumenda eligendi itaque eum voluptate non!
      </p>
    </div>
  </WaterMark>,
  mountNode);
````
