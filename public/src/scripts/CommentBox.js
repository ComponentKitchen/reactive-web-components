import {createStore} from 'redux';
import {h} from 'virtual-dom';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
import ElementBase from 'basic-element-base/src/ElementBase';

const defaultState = {
};

class CommentBox extends ElementBase.compose() {

  reducer(state, action) {
    if (action == null || action.type == null) {
      return state;
    }
    if (state == null) {
      state = defaultState;
    }

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
    <div id="commentBox">
      <h1>Comments</h1>
      <rwc-comment-list></rwc-comment-list>
      <rwc-comment-form></rwc-comment-form>
    </div>
    */
    // BUGBUG - Use JSX and convert to h calls
    return h("div#commentBox", [ "\n  ", h("h1", [ "Comments" ]), "\n  ", h("rwc-comment-list"), "\n  ", h("rwc-comment-form"), "\n" ]);
  }
}

document.registerElement('rwc-comment-box', CommentBox);
export default CommentBox;
