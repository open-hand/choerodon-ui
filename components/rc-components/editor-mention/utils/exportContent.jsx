import { convertToRaw } from 'draft-js';

function encodeContent(text) {
  return text
    .split('&')
    .join('&amp;')

    .split('<')
    .join('&lt;')

    .split('>')
    .join('&gt;')

    .split('\xA0')
    .join('&nbsp;')

    .split('\n')
    .join('<br > \n');
}

class MentionGenerator {
  constructor(contentState, options) {
    this.contentState = contentState;
    this.options = options;
  }
  generate() {
    const contentRaw = convertToRaw(this.contentState);
    return this.processContent(contentRaw);
  }
  processContent(contentRaw) {
    const { blocks } = contentRaw;
    const { encode } = this.options;
    return blocks.map((block) => {
      return encode ? encodeContent(block.text) : block.text;
    }).join(encode ? '<br />\n' : '\n');
  }
}

export default function exportContent(contentState, options = {}) {
  return new MentionGenerator(contentState, options).generate();
}
