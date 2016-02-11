import {createStore} from 'redux';
import {h} from 'virtual-dom';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
import ElementBase from 'basic-element-base/src/ElementBase';

class CommentForm extends ElementBase.compose() {

  reducer(state = {}, action = '') {
    return state;
  }

  createdCallback() {
    if (super.createdCallback) {
      super.createdCallback();
    }

    this.store = createStore(this.reducer);
    this.state = {};
    this.tree = this.render(this.state);
    this.rootNode = create(this.tree);
    this.newTree = {};
    this.patches = {};

    this.store.subscribe(() => {
      this.newTree = this.render(this.store.getState());
      this.patches = diff(this.tree, this.newTree);
      this.rootNode = patch(this.rootNode, this.patches);
      this.tree = this.newTree;
    });

    this.appendChild(this.rootNode);
  }

  render(state = {}) {
    /*
     <div id="CommentForm">
     Hello, world! I am a CommentForm.
     </div>
     */
    // BUGBUG - Use JSX and convert to h calls
    return h('div#commentForm', [ '\n  Hello, world! I am a CommentForm.\n' ]);
  }
}

document.registerElement('rwc-comment-form', CommentForm);
export default CommentForm;
