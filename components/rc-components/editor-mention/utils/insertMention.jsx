import { Modifier, EditorState } from 'draft-js';
import getSearchWord from './getSearchWord';

export default function insertMention(editorState, mention, data, mode) {
  const entityMode = mode === 'immutable' ? 'IMMUTABLE' : 'MUTABLE';
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();

  contentState.createEntity('mention', entityMode, data || mention);
  const searchWord = getSearchWord(editorState, selection);
  const { begin, end } = searchWord;
  const replacedContent = Modifier.replaceText(
    contentState,
    selection.merge({
      anchorOffset: begin,
      focusOffset: end,
    }),
    mention,
    null,
    contentState.getLastCreatedEntityKey()
  );

  const InsertSpaceContent = Modifier.insertText(
    replacedContent,
    replacedContent.getSelectionAfter(),
    ' ',
  );

  const newEditorState = EditorState.push(editorState, InsertSpaceContent, 'insert-mention');
  return EditorState.forceSelection(newEditorState, InsertSpaceContent.getSelectionAfter());
}
