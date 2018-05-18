import getRegExp from './getRegExp';

export default function getMentions(contentState, prefix = '@') {
  const regex = getRegExp(prefix);
  const entities = [];
  contentState.getBlockMap().forEach((block) => {
    const blockText = block.getText();
    let matchArr;
    while ((matchArr = regex.exec(blockText)) !== null) { // eslint-disable-line
      entities.push(matchArr[0].trim());
    }
  });
  return entities;
}
