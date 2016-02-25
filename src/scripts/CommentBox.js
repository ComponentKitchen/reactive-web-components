import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
/* jshint ignore:start */
import {h} from 'virtual-dom';
/* jshint ignore:end */
import ElementBase from 'basic-element-base/src/ElementBase';

class CommentBox extends ElementBase {

  static get defaultState() {
    return {
      commentList: [],
      deepCopy() {
        let copy = Object.assign({}, this);
        copy.commentList = this.commentList.slice();
        return copy;
      }
    };
  }

  static reducer(state, action) {
    if (action == null || action.type == null) {
      return state;
    }
    if (state == null) {
      state = CommentBox.defaultState.deepCopy();
    }

    switch (action.type) {
      case 'ADD_COMMENTS':
        let newState = state.deepCopy();
        for (let i = 0; i < action.comments.length; i++) {
          newState.commentList.push(action.comments[i]);
        }
        return newState;

      default:
        return state;
    }
  }

  createdCallback() {
    if (super.createdCallback) {
      super.createdCallback();
    }

    this.store = createStore(CommentBox.reducer);
    this.state = CommentBox.defaultState.deepCopy();
    this.tree = this.render(this.state);
    this.rootNode = create(this.tree);
    this.newTree = {};
    this.patches = {};

    this.store.subscribe(this.storeListener.bind(this));

    this.appendChild(this.rootNode);
    this.initializeWithMockData();

    // Set up event listener on CommentForm's onCommentSubmit
    document.addEventListener('onCommentFormSubmit', this.handleCommentFormSubmit.bind(this), false);
  }

  initializeWithMockData() {
    const mockDownloadedData = [
      {author: 'Rob Bearman', commentText: 'Hey, Jan, make me a sandwich'},
      {author: 'Jan Miksovsky', commentText: 'Ok, Rob, you are now a sandwich'}
    ];

    const action = {
      type: 'ADD_COMMENTS',
      comments: mockDownloadedData
    };
    this.store.dispatch(action);
  }

  storeListener() {
    this.newTree = this.render(this.store.getState());
    this.patches = diff(this.tree, this.newTree);
    this.rootNode = patch(this.rootNode, this.patches);
    this.tree = this.newTree;
  }

  handleCommentFormSubmit(e) {
    if (e.detail == null || e.detail === undefined) {
      return;
    }

    const action = {
      type: 'ADD_COMMENTS',
      comments: [e.detail]
    };
    this.store.dispatch(action);
  }

  render(state) {
    /* jshint ignore:start */
    return (
      <div id="commentBox">
        <h1>Comments</h1>
        <rwc-comment-list attributes={{"comment-data": JSON.stringify(state.commentList)}}></rwc-comment-list>
        <rwc-comment-form></rwc-comment-form>
      </div>
    );
    /* jshint ignore:end */
  }
}

document.registerElement('rwc-comment-box', CommentBox);
export default CommentBox;
