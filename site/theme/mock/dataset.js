import Mock from 'mockjs';
import omit from 'lodash/omit';

const dsMutationsT = {
  rows: [],
  success: '@boolean()',
};
const dataBlock1 = JSON.parse(`[{"userid":"0","age":63,"name":"彭霞","email":"Deborah","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Hernandez,Lee","codeMultiple_code":["18659458884","12178012355"],"sex":"F","sexMultiple":["F","M"],"account":{"multiple":"M"},"enable":false,"frozen":"N","date":{"startDate":"2020-09-01 00:00:00","endDate":["2020-09-01 00:00:00","2020-09-01 00:00:01"]},"other":{"enemy":[{"userid":"c9A043A3-1E3c-24C9-DDAC-E59D1f877C86","age":61,"name":"孔刚","sex":"M","friends":[{"userid":"FBD3e1dD-DDc9-dC54-e3B1-31D358AbCdC8","age":55,"name":"文强","sex":"M"},{"userid":"e584A4Ec-ad6a-85A7-C356-DEc0a539fD9b","age":54,"name":"黎杰","sex":"M"},{"userid":"7aB423af-85f0-d2Cd-9Efb-A601Cf8236c9","age":99,"name":"乔超","sex":"M"}]},{"userid":"a4cd2D3E-8bc9-Ff0A-5cee-CD6FeD7EA778","age":95,"name":"赵洋","sex":"F","friends":[{"userid":"daB8f6c6-B266-1Bab-fe75-7eaa5b3AC4E9","age":58,"name":"沈磊","sex":"F"},{"userid":"3f3cfc44-C423-7fb1-Bfc6-cfDF88bafD3A","age":20,"name":"锺明","sex":"F"},{"userid":"Fdbc4579-CBDd-eD9C-5D79-E1c34BdBDCBF","age":75,"name":"潘娟","sex":"M"}]},{"userid":"ADfA468f-f36D-b3FF-e7Ac-9FdF6FAd96Bd","age":64,"name":"李伟","sex":"F","friends":[{"userid":"68D1aED6-3b6B-6A5b-AEE7-E19bdb3B574E","age":34,"name":"武平","sex":"M"},{"userid":"f8f6bDbF-2F3A-12E7-c2E9-1bE27C95ce0A","age":34,"name":"傅洋","sex":"M"},{"userid":"2e7C7e2c-C1D6-2D8a-0284-566F154eD701","age":57,"name":"江静","sex":"M"}]}]}},{"userid":"1","age":84,"name":"孔秀兰","email":"Richard","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Lopez,Young","codeMultiple_code":["13391455394","14097673503"],"sex":"M","sexMultiple":["F"],"account":{"multiple":"M,F"},"enable":true,"frozen":"Y","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"d678440B-a7A0-32f6-ABd8-3a2c2112a3Fc","age":54,"name":"顾平","sex":"M","friends":[{"userid":"C475938D-9c0C-1eAb-dD2C-da6EfaDbf9ed","age":95,"name":"傅磊","sex":"F"},{"userid":"fb87867a-EB6B-cDbB-F8Fa-f639800fcF9b","age":92,"name":"阎伟","sex":"F"},{"userid":"5EE33E7f-Ed9E-6AEF-158e-B8962d4c4Eb3","age":93,"name":"吴明","sex":"F"}]},{"userid":"14b20Dc1-8eBB-4d3d-DC9B-bB30A8F4f11A","age":18,"name":"熊娜","sex":"M","friends":[{"userid":"8595Bc9c-5ca1-c9A0-BEC1-FF65Fc252BBb","age":58,"name":"孔明","sex":"M"},{"userid":"723Ec51d-d2AE-c1AD-fe83-23DDc4D54bed","age":62,"name":"苏娟","sex":"M"},{"userid":"8C56e90c-de3d-310c-32ba-6962B4Da58CF","age":24,"name":"锺明","sex":"F"}]},{"userid":"49a6E6ae-C7be-b5D7-36Cb-ea69A5B51AEa","age":80,"name":"秦霞","sex":"M","friends":[{"userid":"FC5C4C23-14dc-7e79-EF7A-e1c96f9Dd337","age":25,"name":"石伟","sex":"M"},{"userid":"F1bC8ffF-99Cc-53CE-C5CF-9CCBdfA4b43f","age":54,"name":"康娟","sex":"M"},{"userid":"C516cB1e-3744-7bDB-cbc6-3EED055b1cf7","age":75,"name":"黄艳","sex":"M"}]}]}},{"userid":"2","age":70,"name":"孟艳","email":"Amy","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Hall,Anderson","codeMultiple_code":["12587439757","15373126369"],"sex":"M","sexMultiple":["F"],"account":{"multiple":"F"},"enable":true,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"93f3CE7c-5d69-99a6-bF33-6c7CdcC359b8","age":97,"name":"唐磊","sex":"F","friends":[{"userid":"7Aa7D0BF-ecc1-FF53-4af8-E40fF3FfeAbd","age":86,"name":"康强","sex":"F"},{"userid":"862c76E3-34A8-3FeC-56ed-cD5beCa0Dc99","age":89,"name":"秦秀英","sex":"M"},{"userid":"cd3D4Af8-FE26-fDce-8Bd9-5e0Bcc2BCee2","age":45,"name":"唐平","sex":"M"}]},{"userid":"DCFb14B4-F1D3-b14a-1eBd-E6c9b94aDa82","age":57,"name":"吕磊","sex":"F","friends":[{"userid":"fe2d3Add-FC0C-BeaB-ef7B-Ba5f364Caae8","age":68,"name":"段磊","sex":"M"},{"userid":"59be86Fc-8e9d-7FDe-26C9-3f8b6c93e1dC","age":81,"name":"秦超","sex":"M"},{"userid":"6e8B03BA-4225-2C39-b386-40ae6A57EDAd","age":66,"name":"夏秀兰","sex":"F"}]},{"userid":"b56F4c35-4DB6-3480-Ab32-69F6CBA9cDd3","age":87,"name":"沈秀兰","sex":"M","friends":[{"userid":"a35c1cC5-714B-C7fC-14bd-717D4A6ce21A","age":93,"name":"李娜","sex":"M"},{"userid":"1b3c4160-1D2E-e6bF-6A0F-F2F8623818BA","age":56,"name":"傅洋","sex":"M"},{"userid":"3ef1B90F-A188-91bc-8ecB-FBEdE07E2CC7","age":99,"name":"马芳","sex":"F"}]}]}},{"userid":"3","age":86,"name":"邱芳","email":"Brenda","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Hernandez,Anderson","codeMultiple_code":["13843718371","16962985648"],"sex":"M","sexMultiple":["F"],"account":{"multiple":"M"},"enable":false,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"2D7a9Aa5-35D4-81D7-1b9f-25AD9B3eA6f9","age":71,"name":"沈洋","sex":"F","friends":[{"userid":"cCC49CF5-d8b9-db78-1a92-673A9dC72AE1","age":26,"name":"黎芳","sex":"F"},{"userid":"eeC575Bb-E2A7-f2C6-273E-E6D99be4567D","age":83,"name":"熊刚","sex":"M"},{"userid":"C6BDDD65-fFB5-e8ec-5865-06eEA4ABbA35","age":23,"name":"段芳","sex":"F"}]},{"userid":"EbCA1051-cC3E-92cc-95BA-3FfdAc067De0","age":47,"name":"胡娟","sex":"F","friends":[{"userid":"8A4b71bD-7D47-d1C3-Db8D-1F05FfaA0EBf","age":43,"name":"于秀英","sex":"M"},{"userid":"dac8FFF3-b588-98A7-B7c7-1362dDF5A350","age":46,"name":"康明","sex":"F"},{"userid":"De9bEEAb-C1f7-43bC-cC8a-d6b92Ba1beeA","age":53,"name":"朱静","sex":"F"}]},{"userid":"6eb5F6Cb-cb1D-8E2c-bd7f-65bC2fB8eD2F","age":92,"name":"赖静","sex":"F","friends":[{"userid":"CF8DA33C-d3bc-Eb9d-141E-85A7BEF8DAdE","age":89,"name":"陆强","sex":"M"},{"userid":"fde9947f-1b7D-afe1-2b15-Ae67C1a79DdA","age":73,"name":"唐明","sex":"M"},{"userid":"c696F6dB-D5f8-8a84-6A2C-bEE5A378DeBC","age":51,"name":"龚勇","sex":"M"}]}]}},{"userid":"4","age":45,"name":"叶芳","email":"Joseph","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Lewis,Williams","codeMultiple_code":["12275587434","12373276866"],"sex":"F","sexMultiple":["F"],"account":{"multiple":"M"},"enable":true,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"6FA8b1db-F651-A7ED-CD0A-4BC7845F4eBd","age":50,"name":"陈强","sex":"M","friends":[{"userid":"BB1f21BA-2742-eF97-d812-ee4Dd4C73C17","age":26,"name":"赵军","sex":"F"},{"userid":"21f6A674-DD42-beb1-Be0C-C932CdDe4D5f","age":45,"name":"董平","sex":"F"},{"userid":"3a1D2Fb5-5C56-fdA5-f5cC-1D95C5ccdF11","age":25,"name":"贾刚","sex":"F"}]},{"userid":"cAc9daE9-dCD4-dfa9-AAB7-7E5EB67c1ff8","age":69,"name":"郑娟","sex":"F","friends":[{"userid":"Dd51D34F-cc3d-52BC-bC7B-38F2bD2F1BB2","age":55,"name":"贾涛","sex":"F"},{"userid":"dff27639-bb6d-beB1-B50A-eF6967b5cEDB","age":95,"name":"朱明","sex":"M"},{"userid":"4Cd51E65-ee27-683F-76D1-AdEf6FDDD890","age":77,"name":"汤涛","sex":"F"}]},{"userid":"aDF4cD4b-Be6A-AeFC-52CB-FAFeE28DD04f","age":71,"name":"汤平","sex":"F","friends":[{"userid":"FEbFaBF1-c631-2cc0-8815-3B2C67b91C1e","age":63,"name":"杜娜","sex":"F"},{"userid":"561B707c-299A-eef9-8Cc9-bb93DdEaA410","age":51,"name":"邱超","sex":"M"},{"userid":"95AbD99E-FeAF-d06b-5DA1-b7E1e45aC26A","age":61,"name":"康勇","sex":"M"}]}]}}]`);
const dataBlock2 = JSON.parse(`[{"userid":"5","age":49,"name":"雷秀兰","email":"Laura","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Johnson,Garcia","codeMultiple_code":["11753197881","12775590362"],"sex":"M","sexMultiple":["F"],"account":{"multiple":"F"},"enable":false,"frozen":"Y","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"F6Ac13FA-CebF-5AE4-A6cc-Df3BFAB9daD6","age":51,"name":"朱刚","sex":"M","friends":[{"userid":"aBDE20Dd-e262-aC7E-5d0a-0e9b22DcB4e7","age":77,"name":"乔刚","sex":"F"},{"userid":"E84D3F40-4b18-D61E-9D22-8Abd8bf699ef","age":97,"name":"邱明","sex":"F"},{"userid":"FE3BcCe2-CeFd-77Cf-0BF6-BfdEe014c1EF","age":48,"name":"毛娜","sex":"M"}]},{"userid":"ac5E2eDe-dd46-03Bc-30ff-91B5d9E43bFa","age":87,"name":"李军","sex":"M","friends":[{"userid":"E4F65F92-7Dbc-5BE5-AAdD-AA3B2FAF7cFA","age":49,"name":"高敏","sex":"M"},{"userid":"9dDc77A8-4b28-c66D-8eac-94f9Bdb5dec1","age":82,"name":"万秀兰","sex":"M"},{"userid":"6bf75E1c-acfF-E9D7-BdDD-4EEAfeC1BDD6","age":83,"name":"周洋","sex":"M"}]},{"userid":"45CEbCeE-F5e1-f7fF-2B9d-67cc27d543cC","age":45,"name":"苏娟","sex":"M","friends":[{"userid":"7169AEF3-4d2f-DcB6-E6E4-E8899E213D92","age":71,"name":"罗洋","sex":"M"},{"userid":"DA730A42-DCbF-544e-3ACC-DF1C28B8BAca","age":53,"name":"孙军","sex":"F"},{"userid":"DC4E6e99-c17b-a585-DeE6-dFD48BeCdBA2","age":44,"name":"姜桂英","sex":"M"}]}]}},{"userid":"6","age":51,"name":"唐静","email":"Joseph","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Hernandez,Lewis","codeMultiple_code":["15117312751","18385680448"],"sex":"M","sexMultiple":["M"],"account":{"multiple":"F"},"enable":true,"frozen":"Y","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"b68FB3ba-Cd3F-5d0d-992e-E934b212cE5D","age":64,"name":"朱芳","sex":"F","friends":[{"userid":"Cd6A611f-b21F-0B8e-3948-67c7EA329FBA","age":82,"name":"周杰","sex":"F"},{"userid":"84aFF26D-Af58-E3Ac-aaE9-F18FfBFb8Df4","age":98,"name":"乔勇","sex":"F"},{"userid":"eDCFB1fd-25bE-f794-DbCD-CEA59d79B87c","age":82,"name":"丁刚","sex":"M"}]},{"userid":"E30A17D9-be5C-AF6F-B8CB-03b90E41e1Bd","age":25,"name":"宋娟","sex":"F","friends":[{"userid":"BC3EF3dF-89aE-2Dd1-d6be-f03E21EDd682","age":90,"name":"石丽","sex":"F"},{"userid":"b9DDDe9c-B3d8-8bf2-1Dea-4b8a73bcF3bC","age":24,"name":"朱敏","sex":"M"},{"userid":"f25c0AdB-faEB-a905-93E4-eA40Ce6Ae2cC","age":38,"name":"唐秀兰","sex":"M"}]},{"userid":"30CBCf8d-c7d2-DDb7-d4e3-FfF506f98D43","age":60,"name":"常娜","sex":"M","friends":[{"userid":"c4C30EDb-CbF2-A5d5-Df3c-aF050bCb225D","age":66,"name":"乔秀英","sex":"M"},{"userid":"e31bd8CD-9C31-656c-68CE-74f4B1E8D1eB","age":61,"name":"邹娟","sex":"F"},{"userid":"e4CEC7Fc-E2A1-fdFA-0Be5-FdA5C8F745F2","age":92,"name":"傅涛","sex":"F"}]}]}},{"userid":"7","age":36,"name":"赵秀英","email":"Donald","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Gonzalez,Robinson","codeMultiple_code":["14455355869","14877417613"],"sex":"F","sexMultiple":["M"],"account":{"multiple":"M"},"enable":false,"frozen":"Y","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"bB33861F-BcBC-9dE8-9514-D7C32CcC51d4","age":95,"name":"罗平","sex":"M","friends":[{"userid":"ecc4AFD5-7d36-1D4D-8fb3-9Cf72325aeB9","age":73,"name":"黄军","sex":"M"},{"userid":"967C6AEe-feDD-CaFC-5F6E-15eAAF58CbE5","age":40,"name":"金超","sex":"F"},{"userid":"26646dbF-e4cF-bf62-873e-F8becd275A2B","age":78,"name":"杜刚","sex":"F"}]},{"userid":"Aa6dF191-63eD-1660-FDDc-6ecc8d2a5e1D","age":23,"name":"尹秀兰","sex":"M","friends":[{"userid":"7683fF25-F62A-50b4-FeDe-11D5cFCf1238","age":66,"name":"赖明","sex":"F"},{"userid":"1D4Bb45D-39cb-a6ba-c5d6-eF3DfFf57Ea9","age":36,"name":"冯桂英","sex":"F"},{"userid":"7C241Af0-59AE-Cc9C-F666-90f5be3fC0Af","age":55,"name":"邱秀英","sex":"F"}]},{"userid":"Bf78Fff7-5959-1d65-8c0f-9210A3EdE3c4","age":72,"name":"马娜","sex":"F","friends":[{"userid":"0BebA260-3cF9-c67c-Fe88-9dACFe52e1Ff","age":76,"name":"段刚","sex":"M"},{"userid":"fFeCFbDB-Fee2-91Bb-b675-adB7Cd58ae57","age":98,"name":"杨超","sex":"F"},{"userid":"9Fdd6557-3cF9-99f5-CB73-bCB5FbA765b2","age":21,"name":"何芳","sex":"F"}]}]}},{"userid":"8","age":64,"name":"杨军","email":"Charles","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Hall,Walker","codeMultiple_code":["13285577118","19935573130"],"sex":"M","sexMultiple":["M","M"],"account":{"multiple":"M"},"enable":true,"frozen":"Y","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"B2dAfAa2-3fF3-3cc6-Ed5A-E6Ab477298Ce","age":35,"name":"万秀英","sex":"F","friends":[{"userid":"e5966C48-D6D9-afD8-fc08-Dc14F1EA5C46","age":85,"name":"郑艳","sex":"F"},{"userid":"C82183c3-D617-7D1f-4D06-0A419ED94E18","age":40,"name":"郑娜","sex":"M"},{"userid":"9F6cf6Dd-aeEB-EC1d-B79d-1aD757d5bCe6","age":26,"name":"刘娟","sex":"M"}]},{"userid":"12DaF1F5-B955-4E0A-e7Ea-FB01eed6EDdD","age":57,"name":"马静","sex":"F","friends":[{"userid":"eDaf83fC-4458-cDC4-9AbF-DE72E3DdeBe1","age":31,"name":"秦秀英","sex":"F"},{"userid":"cefc49CA-aEdE-3D94-2784-db3bf2A011B6","age":30,"name":"林丽","sex":"F"},{"userid":"D547724E-a88e-Fd6f-F8EC-649e69B0EBB6","age":88,"name":"乔明","sex":"M"}]},{"userid":"A29cb9Ca-fD33-EFE2-Aa33-DfBBF0ffeB1c","age":26,"name":"邓敏","sex":"F","friends":[{"userid":"4CAdAdEe-9D3E-07D4-531B-e20eb661c810","age":62,"name":"孟洋","sex":"F"},{"userid":"D863A4A7-1ceb-90c9-656D-9562F35813B4","age":44,"name":"易超","sex":"M"},{"userid":"313EBA9b-C426-DdFc-084a-1DcBeeA9Da5d","age":99,"name":"田伟","sex":"M"}]}]}},{"userid":"9","age":57,"name":"谢秀兰","email":"Brenda","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Robinson,White","codeMultiple_code":["19103442778","12361616126"],"sex":"M","sexMultiple":["F","F"],"account":{"multiple":"M"},"enable":true,"frozen":"Y","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"19150EfC-D0E8-db0c-C3BE-FeeE9fCB5fbE","age":38,"name":"赖强","sex":"M","friends":[{"userid":"810ca9bb-C795-0C2e-7DCc-f6Abf4E62796","age":98,"name":"陈艳","sex":"M"},{"userid":"Ce3B57CC-3b39-EcCf-13A6-EEAeB0Fbc3d3","age":30,"name":"吴秀英","sex":"M"},{"userid":"23F2aADB-F5Db-cCDb-e81c-79BE6DFFaFc4","age":40,"name":"黄芳","sex":"F"}]},{"userid":"2BC3c178-74e0-ddB6-7CE3-C1Adc43AF224","age":37,"name":"龚芳","sex":"F","friends":[{"userid":"dEebE2fB-D028-fcdf-9cfE-975Dd2Dd62d9","age":93,"name":"邓丽","sex":"M"},{"userid":"bFE5F788-E56A-4bDc-1cF5-4cBd7ACFD9F9","age":38,"name":"王明","sex":"M"},{"userid":"aF5dB8Ec-e4B7-5d05-AF2F-dc9fA1bd3e8d","age":24,"name":"孟艳","sex":"M"}]},{"userid":"ab99a468-aB21-Db8a-49ec-0D694115C59D","age":82,"name":"谢平","sex":"F","friends":[{"userid":"bc6EEa03-2F1C-Ae9d-AC5A-Ff5CA662A72F","age":91,"name":"邱秀兰","sex":"M"},{"userid":"cb9f576C-2Cf6-7c57-FBb5-fe571AABD4d2","age":45,"name":"黎敏","sex":"F"},{"userid":"0F2c11CF-f6Bd-56Ad-a6d6-BB9E9d3e9D43","age":50,"name":"高丽","sex":"F"}]}]}}]`);
const dataBlock3 = JSON.parse(`[{"userid":"10","age":80,"name":"冯杰","email":"Brian","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Thomas,Clark","codeMultiple_code":["11135624097","14432778457"],"sex":"F","sexMultiple":["F"],"account":{"multiple":"M"},"enable":true,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"DdA2DBD3-fC6e-13f2-453C-Ff6fA3ACdDCb","age":42,"name":"段芳","sex":"M","friends":[{"userid":"CDFF4554-f9C1-C3cA-AA54-D592d1720BDf","age":58,"name":"邓强","sex":"F"},{"userid":"fa5166e8-5c92-CB52-83dd-8fd8E131Bffc","age":85,"name":"汪秀兰","sex":"F"},{"userid":"6D1dA5B3-AeDA-9DB7-c475-392dB5F259aa","age":48,"name":"曾娜","sex":"M"}]},{"userid":"c1Bb3e65-33AB-aBc6-AFd9-C5bFf80fE12a","age":43,"name":"黎芳","sex":"F","friends":[{"userid":"Fe7B395f-58Cb-b74C-4dbC-cE73c84DedbB","age":66,"name":"薛杰","sex":"F"},{"userid":"5ea577Fd-6E94-27Db-fAdc-A6bF2eB8dCEC","age":34,"name":"孙勇","sex":"F"},{"userid":"5e422eF6-AffD-559B-1681-A855E790B41d","age":66,"name":"熊丽","sex":"F"}]},{"userid":"0bEEd8d1-18fF-9E67-7fec-5C1cB07fcEfF","age":47,"name":"卢洋","sex":"M","friends":[{"userid":"c44a0EF2-8387-5AbB-bf9e-db9B8bCEA511","age":56,"name":"文超","sex":"F"},{"userid":"4cF6AF8E-fBfE-e68F-4ec0-DFe41e7aBb44","age":86,"name":"夏强","sex":"F"},{"userid":"1c7dc9c1-Dbc6-344d-fAd9-FcefA3F7faCE","age":32,"name":"姜平","sex":"F"}]}]}},{"userid":"11","age":31,"name":"黄敏","email":"Melissa","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Clark,White","codeMultiple_code":["14677532368","18382734574"],"sex":"F","sexMultiple":["F","M"],"account":{"multiple":"M,F"},"enable":true,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"D5163A2F-a34f-8bAd-8f6e-7c2Fbc1AcE6b","age":37,"name":"梁军","sex":"F","friends":[{"userid":"fCdbce01-B254-Dfb2-b34A-fdEfd7baEdA6","age":83,"name":"阎刚","sex":"M"},{"userid":"2Fda1FaA-7d8E-C87d-3CC9-92DdcD1B5D7E","age":47,"name":"叶秀英","sex":"F"},{"userid":"D42c8fBf-77FA-8d1B-E2bc-efBA55c8B452","age":76,"name":"任勇","sex":"F"}]},{"userid":"c0d8cEBA-fAf6-699a-523f-b1FA0F7fCEC7","age":23,"name":"康丽","sex":"F","friends":[{"userid":"3f57EE5D-7Cfa-dD7b-ef15-AafF11D5FDC3","age":61,"name":"郝磊","sex":"M"},{"userid":"5Deea418-dcd1-344d-5b5A-9A7CadCEeBeb","age":65,"name":"孙磊","sex":"M"},{"userid":"2683cEFF-9cBF-96eb-310c-DedE9C2c918b","age":46,"name":"郝娟","sex":"M"}]},{"userid":"3eA612be-A4aD-BF33-772B-1Bd2c84c75ec","age":38,"name":"常霞","sex":"M","friends":[{"userid":"bDf0A6DB-c28f-c8C1-e3d6-F11C73bFAC0D","age":73,"name":"袁娟","sex":"M"},{"userid":"CF5D5ebF-E86d-33B4-CD2c-29F24F6F228b","age":42,"name":"常秀英","sex":"F"},{"userid":"d6d4df9F-203f-75f6-0fDd-1c989aED58EE","age":65,"name":"贾超","sex":"F"}]}]}},{"userid":"12","age":26,"name":"蔡超","email":"Gary","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Johnson,Brown","codeMultiple_code":["17171712227","17770581941"],"sex":"M","sexMultiple":["F","F"],"account":{"multiple":"F,M"},"enable":true,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"2Ed98f79-B197-b19c-FCF1-F0b1c347C768","age":74,"name":"梁娜","sex":"F","friends":[{"userid":"03dC4FfB-BB3A-003E-4cCD-EFCd5B89CD56","age":27,"name":"宋芳","sex":"F"},{"userid":"98FF1e1C-CFcB-5fdd-159b-D5E3BF15DCF0","age":61,"name":"雷勇","sex":"M"},{"userid":"1A333fC3-23FE-bAfC-7ea7-67b59cCa3D77","age":60,"name":"胡洋","sex":"M"}]},{"userid":"A8C9cdC6-eA48-4AAb-f40C-52dfefAf7dEb","age":24,"name":"汪丽","sex":"M","friends":[{"userid":"af0A47ca-A7D9-2535-fC4c-Fc4CeF3DD6cC","age":87,"name":"邹伟","sex":"F"},{"userid":"9fCfFAeE-9df6-3F5C-eFCF-d2fE4D797fA0","age":59,"name":"蒋娜","sex":"M"},{"userid":"238aa7BE-7286-49Af-5e4A-CF76cA5c8757","age":60,"name":"唐刚","sex":"F"}]},{"userid":"B1356bf1-fA28-3c66-Ce99-689233e4B9DA","age":95,"name":"马丽","sex":"M","friends":[{"userid":"AAC3EbD3-18Db-c842-bBcC-fCe698ddB9fC","age":24,"name":"龚秀英","sex":"M"},{"userid":"fF6B247C-A4Ff-FAdD-4Ac8-aC145E4ca53A","age":84,"name":"汪丽","sex":"F"},{"userid":"CD185E9e-4E51-2bC8-C7cb-BcDF990Eec4B","age":64,"name":"尹伟","sex":"M"}]}]}},{"userid":"13","age":52,"name":"史涛","email":"Kevin","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Lewis,Rodriguez","codeMultiple_code":["16233933372","11993564652"],"sex":"F","sexMultiple":["M"],"account":{"multiple":"M,F"},"enable":false,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"cC86Cb59-d3Fd-bCF6-f1e8-73324A22cE1f","age":80,"name":"郝勇","sex":"F","friends":[{"userid":"bC2BB5F8-2D9e-Ef32-E3C0-034CC4aBfC4e","age":22,"name":"汪杰","sex":"F"},{"userid":"571e1BcF-9DfA-D74e-E64f-1EeDeCc2e396","age":67,"name":"方艳","sex":"F"},{"userid":"5Ef53CC8-4e07-911f-3B5E-fDd9ABEcAFee","age":25,"name":"蔡娜","sex":"F"}]},{"userid":"EBfe0cdC-c097-32BB-2ae2-4d54F13c9E53","age":24,"name":"朱超","sex":"F","friends":[{"userid":"ad663df4-Bc5A-9d7f-B27A-3ac1D9cf8b3F","age":72,"name":"叶敏","sex":"F"},{"userid":"4cfdbda5-D49A-ce3F-4aEa-bF0dFCef534a","age":25,"name":"胡秀兰","sex":"F"},{"userid":"cAE66F1E-bBeb-FAdd-CC5a-b23CBCa9ACA1","age":85,"name":"邵勇","sex":"F"}]},{"userid":"1Da1C1DD-F48C-Fc48-FEBc-48A6C4f3b7fE","age":61,"name":"邱静","sex":"M","friends":[{"userid":"abaEdb24-EabD-c669-7D89-cD2C31b527D1","age":24,"name":"侯明","sex":"M"},{"userid":"CbA1d6eA-EC7C-Add6-1dEd-bF1c8DdCAd1f","age":92,"name":"王明","sex":"M"},{"userid":"65A4BEDc-6500-E4ef-e65C-74fCe66A7765","age":93,"name":"萧娜","sex":"F"}]}]}},{"userid":"14","age":89,"name":"廖军","email":"Robert","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Gonzalez,Garcia","codeMultiple_code":["11821134265","15220587418"],"sex":"F","sexMultiple":["F"],"account":{"multiple":"M"},"enable":true,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"a2Db4FbD-dC0d-5E86-67BC-5828A777ff8A","age":59,"name":"曾娜","sex":"F","friends":[{"userid":"32b38ccf-4f5A-af7D-50D4-bA1deeECef5C","age":22,"name":"董娜","sex":"F"},{"userid":"E5bf8bb6-21af-4CdC-Fd61-C3415dcDE4F9","age":46,"name":"钱丽","sex":"M"},{"userid":"2ce48bfE-fad5-70CE-5Bb5-Ad45B6CB4b2D","age":87,"name":"钱秀兰","sex":"M"}]},{"userid":"Eaeae38C-cF49-e25E-63ec-D603Ae06138E","age":65,"name":"何秀兰","sex":"F","friends":[{"userid":"Bb89ea78-deA8-2DAE-AB41-6da97417dAEb","age":89,"name":"马军","sex":"F"},{"userid":"b5f2EbCC-4e1a-6FA8-1D5A-49C461c7Aa09","age":74,"name":"林杰","sex":"F"},{"userid":"9cB1d7df-6DAE-9371-BbEc-fe5cbEb845A2","age":47,"name":"史平","sex":"F"}]},{"userid":"bEA3C09e-1Eef-D1A6-462F-bfbe88d20c3C","age":32,"name":"曹丽","sex":"M","friends":[{"userid":"a2eD9fCC-FDed-0e1E-E93a-299f4ddbbcBa","age":19,"name":"汤勇","sex":"F"},{"userid":"B7C152F3-AfBE-bB12-129c-c1D6F1eeb2dE","age":48,"name":"秦秀兰","sex":"M"},{"userid":"8CfF34D2-bFBB-eCD5-E7dc-b5e6eb8c0E7e","age":100,"name":"文勇","sex":"M"}]}]}}]`);
const dataBlock4 = JSON.parse(`[{"userid":"15","age":35,"name":"戴刚","email":"Jeffrey","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Martinez,Lopez","codeMultiple_code":["15255161274","13412147173"],"sex":"F","sexMultiple":["M","F"],"account":{"multiple":"M"},"enable":true,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"56194d22-C624-FfBF-83b3-6Fd05f370fC5","age":46,"name":"锺伟","sex":"F","friends":[{"userid":"5990CFFE-33A5-511c-D4Fb-a6CcFeC6dCCc","age":41,"name":"曾涛","sex":"F"},{"userid":"5A7B87f1-eF93-f59E-D7A0-cbedEE85DCE9","age":74,"name":"潘霞","sex":"M"},{"userid":"0ddD03d1-7ccD-1cfF-73E7-c26d1486d5B1","age":88,"name":"董艳","sex":"M"}]},{"userid":"a264fbc9-FdC2-CB4F-AC64-DE2E2fF14BC7","age":84,"name":"唐艳","sex":"F","friends":[{"userid":"D52FC0d2-c9AC-69eD-BcD5-184EFb8c3DC0","age":34,"name":"邱伟","sex":"F"},{"userid":"922dFEAA-1F18-FfaC-eeA2-2E92f2B2A36F","age":21,"name":"高秀兰","sex":"F"},{"userid":"bc2bCD5e-D1cF-147E-14B5-c09C31a3CDbc","age":45,"name":"马娟","sex":"M"}]},{"userid":"fFC53ddc-5e68-DbDf-b9a6-21D26DfcbcFD","age":45,"name":"江娜","sex":"F","friends":[{"userid":"dE33db18-ec4e-9Cfe-cdcB-fdD76ECD09f0","age":64,"name":"熊军","sex":"M"},{"userid":"f90A7eB1-3eBF-BCdB-dAcE-010E8F36dCBe","age":63,"name":"梁秀英","sex":"F"},{"userid":"1d755Ef1-91d8-83b2-551B-35E56176eDdf","age":69,"name":"雷娜","sex":"F"}]}]}},{"userid":"16","age":44,"name":"许磊","email":"Elizabeth","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Garcia,Lewis","codeMultiple_code":["15784112646","12591326633"],"sex":"M","sexMultiple":["F"],"account":{"multiple":"F"},"enable":true,"frozen":"Y","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"B9ccA338-9D16-2AE2-0FAD-3f1A1FdC098d","age":41,"name":"曹明","sex":"F","friends":[{"userid":"dD9E4c7f-0d5A-B3AB-aF0e-beee4C65D86C","age":93,"name":"杨芳","sex":"F"},{"userid":"C4bb19bf-Bc46-5B77-F25A-a466250d2CFD","age":56,"name":"史秀兰","sex":"M"},{"userid":"D37c5Ebd-fDAc-619B-699b-1d7C745E5C46","age":34,"name":"万强","sex":"M"}]},{"userid":"A58FDc25-FD9d-255d-9CeE-24F4dCeF1fA7","age":46,"name":"高强","sex":"M","friends":[{"userid":"deFa39cd-E899-53FB-CE4A-69A6ddDB9E96","age":55,"name":"董超","sex":"M"},{"userid":"a9dcAa9d-D2F9-3D21-EeEb-Fe3dFeecd72c","age":59,"name":"宋敏","sex":"M"},{"userid":"5253e7F1-cDEE-2Bfd-cD6e-Df6eAA7dC6df","age":53,"name":"曹秀英","sex":"M"}]},{"userid":"0d941A63-f23E-4AfF-8dd7-D3c01fd9C470","age":29,"name":"罗杰","sex":"M","friends":[{"userid":"BeeeFA34-1Cf5-A51A-E225-Eed7F24A1f57","age":49,"name":"段磊","sex":"F"},{"userid":"BF78EF3E-bCCd-18bf-BeD6-3F832cb3c83b","age":26,"name":"赵杰","sex":"M"},{"userid":"de4659fB-9729-DFFB-3fDb-52BAAf4B2221","age":65,"name":"贾勇","sex":"F"}]}]}},{"userid":"17","age":78,"name":"毛强","email":"Jose","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Taylor,Taylor","codeMultiple_code":["11481538633","15716537186"],"sex":"F","sexMultiple":["F"],"account":{"multiple":"M"},"enable":true,"frozen":"Y","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"6A9dfE53-9f7E-0Bdf-745d-e04b9AC320c1","age":42,"name":"高强","sex":"F","friends":[{"userid":"fBcD55AD-BAa3-fDeb-38Eb-5f7f8a4BBd62","age":54,"name":"戴秀英","sex":"M"},{"userid":"6494B26B-FDb5-FD5c-Afe9-6dbe55dd1302","age":56,"name":"唐敏","sex":"F"},{"userid":"c6B5ea38-9F8e-Cd59-Dd89-f5FcB12Ef8e1","age":32,"name":"廖洋","sex":"F"}]},{"userid":"FBfe86Fa-cAdb-d5bc-Ce8B-47D1B2de2Df9","age":80,"name":"赖秀兰","sex":"M","friends":[{"userid":"531751Bf-05dD-EBAD-e1ed-4bf86F516a9f","age":83,"name":"吴敏","sex":"M"},{"userid":"De5DfB55-6F79-9dBd-A593-d4C6CA726Bd9","age":24,"name":"郑芳","sex":"M"},{"userid":"0ecb34e8-B562-CFf1-bC8B-C2D8cfecABEA","age":70,"name":"冯平","sex":"F"}]},{"userid":"AecE7BFf-ac24-0ff9-17DC-A87f2B5F6D1C","age":43,"name":"唐明","sex":"F","friends":[{"userid":"eEB7BAD6-7e7A-E4ce-c37b-6cDd3114Fb54","age":79,"name":"金敏","sex":"F"},{"userid":"cE57c96a-E48D-aB4e-79fF-b8B8a0289cD9","age":70,"name":"黎刚","sex":"M"},{"userid":"38ADe289-BeC9-8338-fd65-dAFD36B6df16","age":62,"name":"姜平","sex":"F"}]}]}},{"userid":"18","age":57,"name":"程丽","email":"Michelle","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Williams,Perez","codeMultiple_code":["18621501262","18622746234"],"sex":"M","sexMultiple":["F","M"],"account":{"multiple":"F,M"},"enable":true,"frozen":"Y","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"6cFF78eF-AbbD-B49a-36A1-a23c88d04ee1","age":94,"name":"傅平","sex":"F","friends":[{"userid":"CFcC032b-773c-9dE4-Be90-F3a6F80Fbd49","age":33,"name":"田敏","sex":"F"},{"userid":"fD5A2d6C-7D2C-367D-f4eD-73B3a74799C3","age":22,"name":"沈静","sex":"F"},{"userid":"98a77Cc7-A417-BE4c-3d83-4C9CB8F53FD6","age":35,"name":"邹娟","sex":"M"}]},{"userid":"24dCebc4-39b0-1F55-dAf1-DeA7D70f193e","age":57,"name":"孔秀兰","sex":"F","friends":[{"userid":"8A8C2431-753d-617C-Ec1d-9b77672DEaed","age":78,"name":"魏娟","sex":"M"},{"userid":"bBbd7d89-1f33-d1FA-7f68-495F1e8D28b6","age":28,"name":"苏艳","sex":"M"},{"userid":"94eB463B-ABB5-Adc9-DcDf-f2a3C8EAFeAC","age":20,"name":"朱娟","sex":"F"}]},{"userid":"5d34AE7d-3F8C-E9b9-e5F9-bdbb43Af0d9b","age":58,"name":"郑刚","sex":"F","friends":[{"userid":"c38Db77C-f3Aa-8fA9-E5AE-bB7Dd7430f7e","age":65,"name":"康芳","sex":"M"},{"userid":"03Fbcf15-468D-CDF5-e87E-a5dECab9bb7E","age":58,"name":"韩秀兰","sex":"M"},{"userid":"DcBDf36b-171c-Ebc3-1B7e-72CF5D7cF1C3","age":73,"name":"杨芳","sex":"F"}]}]}},{"userid":"19","age":33,"name":"吕杰","email":"Angela","code_description":"员工状态","code_code":"HR.EMPLOYEE_STATUS","code_select":"HR.EMPLOYEE_GENDER","codeMultiple_description":"Hernandez,Walker","codeMultiple_code":["11258064898","11113747663"],"sex":"M","sexMultiple":["F","F"],"account":{"multiple":"F,M"},"enable":true,"frozen":"N","date":{"startDate":null,"endDate":null},"other":{"enemy":[{"userid":"2bb31bc3-1E73-4b84-4E4a-c58ff20eDBF1","age":34,"name":"龙娜","sex":"F","friends":[{"userid":"79d1C93e-19FC-b38a-4Cce-bA2c2c686a85","age":53,"name":"冯磊","sex":"M"},{"userid":"D8e9c9Ce-215f-01EA-5dba-177c9Beaeeff","age":72,"name":"万涛","sex":"M"},{"userid":"a3cFcc4a-87Ed-fB87-def8-D9e9F8Ddf2F8","age":82,"name":"易秀英","sex":"F"}]},{"userid":"68db4BdB-E8B1-7fa5-dF23-568DfcbeEF2a","age":82,"name":"唐敏","sex":"F","friends":[{"userid":"b3CEF2EA-7891-3951-c9dD-d8Ebd5377d4d","age":57,"name":"尹刚","sex":"F"},{"userid":"FA970786-2dF9-a9E6-B82b-cd9D1304FbA8","age":85,"name":"赖伟","sex":"F"},{"userid":"e8e33b64-b222-4CEB-6F35-e8158F6fcfAB","age":84,"name":"吕艳","sex":"M"}]},{"userid":"eA7DfdB8-d7eD-7C1f-Bd98-c16BDB2dB592","age":25,"name":"雷强","sex":"M","friends":[{"userid":"8F7FF311-b176-830c-C6fb-325F16A4c5Fb","age":62,"name":"赖明","sex":"F"},{"userid":"beaCcDb4-f163-7D40-c8fd-34880ec38EfE","age":45,"name":"阎超","sex":"M"},{"userid":"EfE4BCFc-C2cA-a5ED-d1cB-BDf34cd3cc15","age":56,"name":"郝勇","sex":"F"}]}]}}]`);

const dsQueriesT = {
  rows: [
    ...dataBlock1,
    ...dataBlock2,
    ...dataBlock3,
    ...dataBlock4,
  ],
  total: 20,
  success: true,
};
const dsQueriesTCount = {
  total: 20,
  success: true,
};

const dsQueriesSize5Page1TCount = {
  rows: dataBlock1,
  success: true,
  needCountFlag: 'Y',
};
const dsQueriesSize1Page1T = {
  rows: dataBlock1.slice(0, 1),
  total: 20,
  success: true,
};
const dsQueriesSize1Page2T = {
  rows: dataBlock1.slice(1, 2),
  total: 20,
  success: true,
};
const dsQueriesSize5Page1T = {
  rows: dataBlock1,
  total: 20,
  success: true,
};
const dsQueriesSize5Page2T = {
  rows: dataBlock2,
  total: 20,
  success: true,
};
const dsQueriesSize5Page3T = {
  rows: dataBlock3,
  total: 20,
  success: true,
};
const dsQueriesSize5Page4T = {
  rows: dataBlock4,
  total: 20,
  success: true,
};
const dsQueriesSize10Page1T = {
  rows: [
    ...dataBlock1,
    ...dataBlock2,
  ],
  total: 20,
  success: true,
};
const dsQueriesSize10Page2T = {
  rows: [
    ...dataBlock3,
    ...dataBlock4,
  ],
  total: 20,
  success: true,
};

const dsLargeQueriesT = {
  rows: new Array(50)
    .fill(null)
    .reduce((rows, _empty, index) => rows.concat(dsQueriesT.rows.map((item, useid, size) => ({
      ...omit(item, ['other']),
      userid: String((useid + index * size.length) + 1),
    }))), []),
  total: 1000,
  success: true,
};

const dsLanguagesT = {
  rows: [
    {
      name: {
        zh_CN: '@cname()',
        en_GB: '@name()',
        en_US: '@name()',
        ja_JP: '桥本@clast()',
      },
      'first-name': {
        zh_CN: '@cname()',
        en_GB: '@name()',
        en_US: '@name()',
        ja_JP: '本田@clast()',
      },
    },
  ],
  total: 1,
  success: true,
};
const dsValidateT = [true];

const dsMutationsR = /\/dataset\/user\/mutations/;
const dsQueriesR = /\/dataset\/user\/queries/;
const dsQueriesRCount = /\/dataset\/user\/count/;
const dsQueriesRSize5Page1RCount = /\/dataset\/user\/page\/asynccount\/5\/1/;
const dsQueriesRSize1Page1R = /\/dataset\/user\/page\/1\/1/;
const dsQueriesRSize1Page2R = /\/dataset\/user\/page\/1\/2/;
const dsQueriesRSize5Page1R = /\/dataset\/user\/page\/5\/1/;
const dsQueriesRSize5Page2R = /\/dataset\/user\/page\/5\/2/;
const dsQueriesRSize5Page3R = /\/dataset\/user\/page\/5\/3/;
const dsQueriesRSize5Page4R = /\/dataset\/user\/page\/5\/4/;
const dsQueriesRSize10Page1R = /\/dataset\/user\/page\/10\/1/;
const dsQueriesRSize10Page2R = /\/dataset\/user\/page\/10\/2/;
const dsQueriesRSize20Page1R = /\/dataset\/user\/page\/20\/1/;
const dsQueriesRSize50Page1R = /\/dataset\/user\/page\/50\/1/;
const dsQueriesRSize100Page1R = /\/dataset\/user\/page\/100\/1/;
const dsLanguagesR = /\/dataset\/user\/languages/;
const dsValidateR = /\/dataset\/user\/validate/;
const dsLargeQueriesR = /\/dataset\/large-user\/queries/;
const dsMutationsD = Mock.mock(dsMutationsT);
const dsQueriesD = Mock.mock(dsQueriesT);
const dsQueriesDCount = Mock.mock(dsQueriesTCount);
const dsQueriesSize5Page1DCount = Mock.mock(dsQueriesSize5Page1TCount);
const dsQueriesSize1Page1D = Mock.mock(dsQueriesSize1Page1T);
const dsQueriesSize1Page2D = Mock.mock(dsQueriesSize1Page2T);
const dsQueriesSize5Page1D = Mock.mock(dsQueriesSize5Page1T);
const dsQueriesSize5Page2D = Mock.mock(dsQueriesSize5Page2T);
const dsQueriesSize5Page3D = Mock.mock(dsQueriesSize5Page3T);
const dsQueriesSize5Page4D = Mock.mock(dsQueriesSize5Page4T);
const dsQueriesSize10Page1D = Mock.mock(dsQueriesSize10Page1T);
const dsQueriesSize10Page2D = Mock.mock(dsQueriesSize10Page2T);
const dsLanguagesD = Mock.mock(dsLanguagesT);
const dsValidateD = Mock.mock(dsValidateT);
const dsLargeQueriesD = Mock.mock(dsLargeQueriesT);

export default function () {
  if (typeof window !== 'undefined') {
    Mock.setup({ timeout: 0 });

    Mock.mock(dsMutationsR, dsMutationsT);

    Mock.mock(dsQueriesR, dsQueriesT);

    Mock.mock(dsQueriesRCount, dsQueriesDCount);
    Mock.mock(dsQueriesRSize5Page1RCount, dsQueriesSize5Page1TCount);
    Mock.mock(dsQueriesRSize1Page1R, dsQueriesSize1Page1T);
    Mock.mock(dsQueriesRSize1Page2R, dsQueriesSize1Page2T);
    Mock.mock(dsQueriesRSize5Page1R, dsQueriesSize5Page1T);
    Mock.mock(dsQueriesRSize5Page2R, dsQueriesSize5Page2T);
    Mock.mock(dsQueriesRSize5Page3R, dsQueriesSize5Page3T);
    Mock.mock(dsQueriesRSize5Page4R, dsQueriesSize5Page4T);
    Mock.mock(dsQueriesRSize10Page1R, dsQueriesSize10Page1T);
    Mock.mock(dsQueriesRSize10Page2R, dsQueriesSize10Page2T);
    Mock.mock(dsQueriesRSize20Page1R, dsQueriesT);
    Mock.mock(dsQueriesRSize50Page1R, dsQueriesT);
    Mock.mock(dsQueriesRSize100Page1R, dsQueriesT);

    Mock.mock(dsLanguagesR, dsLanguagesT);

    Mock.mock(dsValidateR, dsValidateT);

    Mock.mock(dsLargeQueriesR, dsLargeQueriesT);
  }
}

export const dsTempleList = [
  { rule: dsMutationsR, data: dsMutationsD },
  { rule: dsQueriesR, data: dsQueriesD },
  { rule: dsQueriesRCount, data: dsQueriesDCount },
  { rule: dsQueriesRSize5Page1RCount, data: dsQueriesSize5Page1DCount },
  { rule: dsQueriesRSize1Page1R, data: dsQueriesSize1Page1D },
  { rule: dsQueriesRSize1Page2R, data: dsQueriesSize1Page2D },
  { rule: dsQueriesRSize5Page1R, data: dsQueriesSize5Page1D },
  { rule: dsQueriesRSize5Page2R, data: dsQueriesSize5Page2D },
  { rule: dsQueriesRSize5Page3R, data: dsQueriesSize5Page3D },
  { rule: dsQueriesRSize5Page4R, data: dsQueriesSize5Page4D },
  { rule: dsQueriesRSize10Page1R, data: dsQueriesSize10Page1D },
  { rule: dsQueriesRSize10Page2R, data: dsQueriesSize10Page2D },
  { rule: dsQueriesRSize20Page1R, data: dsQueriesD },
  { rule: dsQueriesRSize50Page1R, data: dsQueriesD },
  { rule: dsQueriesRSize100Page1R, data: dsQueriesD },
  { rule: dsLanguagesR, data: dsLanguagesD },
  { rule: dsValidateR, data: dsValidateD },
  { rule: dsLargeQueriesR, data: dsLargeQueriesD },
];
