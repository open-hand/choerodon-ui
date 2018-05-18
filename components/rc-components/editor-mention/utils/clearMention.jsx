import { Modifier, EditorState } from 'draft-js';
import getSearchWord from './getSearchWord';

export default function clearMention(editorState) {
  const selection = editorState.getSelection();
  const searchWord = getSearchWord(editorState, selection);
  const { begin, end } = searchWord;
  const replacedContent = Modifier.replaceText(
    editorState.getCurrentContent(),
    selection.merge({
      anchorOffset: begin,
      focusOffset: end,
    }),
    '',
    null,
  );

  const InsertSpaceContent = Modifier.insertText(
    replacedContent,
    replacedContent.getSelectionAfter(),
    ' ',
  );

  const newEditorState = EditorState.push(editorState, InsertSpaceContent, 'insert-mention');
  return EditorState.forceSelection(newEditorState, InsertSpaceContent.getSelectionAfter());
}
