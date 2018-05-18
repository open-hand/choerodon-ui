function getWord(text, position) {
  const str = String(text);
  /* eslint no-bitwise:0 */
  const pos = Number(position) >>> 0;

  // Search for the word's beginning and end.
  const left = str.slice(0, pos + 1).search(/\S+$/);
  const right = str.slice(pos).search(/\s/);


  if (right < 0) {
    return {
      word: str.slice(left),
      begin: left,
      end: str.length,
    };
  }

  // Return the word, using the located bounds to extract it from the string.
  return {
    word: str.slice(left, right + pos),
    begin: left,
    end: right + pos,
  };
}

export default function getSearchWord(editorState, selection) {
  const anchorKey = selection.getAnchorKey();
  const anchorOffset = selection.getAnchorOffset() - 1;
  const currentContent = editorState.getCurrentContent();
  const currentBlock = currentContent.getBlockForKey(anchorKey);
  if (currentBlock) {
    const blockText = currentBlock.getText();
    return getWord(blockText, anchorOffset);
  }
  return '';
}
