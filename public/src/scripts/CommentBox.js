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
    this.state = defaultState;
    this.tree = this.render(this.state);
    this.rootNode = create(this.tree);
    this.newTree = {};
    this.patches = {};

    this.store.subscribe(this.storeListener.bind(this));

    this.appendChild(this.rootNode);
  }

  storeListener() {
    this.newTree = this.render(this.store.getState());
    this.patches = diff(this.tree, this.newTree);
    this.rootNode = patch(this.rootNode, this.patches);
    this.tree = this.newTree;
  }

  render(state = defaultState) {
    /* jshint ignore:start */
    const mockDownloadedData = [
      {id: 0, author: 'Rob Bearman', text: 'This is Rob\'s comment'},
      {id: 1, author: 'Jan Miksovsky', text: 'This is Jan\'s comment'}
    ];

    return (
      <div id="commentBox">
        <h1>Comments</h1>
        <rwc-comment-list attributes={{"comment-data": JSON.stringify(mockDownloadedData)}}></rwc-comment-list>
        <rwc-comment-form></rwc-comment-form>
      </div>
    );
    /* jshint ignore:end */
  }
}

document.registerElement('rwc-comment-box', CommentBox);
export default CommentBox;
