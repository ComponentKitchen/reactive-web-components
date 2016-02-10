import {createStore} from 'redux';
import {h} from 'virtual-dom';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
import ElementBase from 'basic-element-base/src/ElementBase';

class CommentList extends ElementBase.compose() {

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
    <div id="commentList">
      <rwc-comment author="Pete Hunt">This is one comment</rwc-comment>
      <rwc-comment author="Jordan Walke">This is *another* comment</rwc-comment>
    </div>
    */
    return h("div#commentList", [ "\n  ", h("rwc-comment", {"attributes":{"author":"Pete Hunt"}}, [ "This is one comment" ]), "\n  ", h("rwc-comment", {"attributes":{"author":"Jordan Walke"}}, [ "This is *another* comment" ]), "\n" ]);
  }
}

document.registerElement('rwc-comment-list', CommentList);
export default CommentList;
