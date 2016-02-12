import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
/* jshint ignore:start */
import {h} from 'virtual-dom';
/* jshint ignore:end */
import ElementBase from 'basic-element-base/src/ElementBase';

const defaultState = {
};

class CommentList extends ElementBase.compose() {

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
    /* jshint ignore:start */
    return (
      <div id="commentList">
        <rwc-comment author="Rob Bearman">Rob's comment</rwc-comment>
        <rwc-comment author="Jan Miksovsky">Jan's comment</rwc-comment>
      </div>
    );
    /* jshint ignore:end */
  }
}

document.registerElement('rwc-comment-list', CommentList);
export default CommentList;
