import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
import {h} from 'virtual-dom'; // jshint ignore:line
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
      state = CommentBox.defaultState;
    }

    switch (action.type) {
      case 'ADD_COMMENTS':
        let newState = state.deepCopy();
        action.comments.map((comment) => {
          newState.commentList.push(comment);
        });
        return newState;

      default:
        return state;
    }
  }

  createdCallback() {
    // Initialize the component state and its Redux store.
    // Build the initial DOM root node and prepare for future virtual-dom patches.
    this.store = createStore(CommentBox.reducer);
    this.state = CommentBox.defaultState;
    this.tree = this.render(this.state);
    this.rootNode = create(this.tree);

    this.store.subscribe(this.storeListener.bind(this));

    this.appendChild(this.rootNode);
    this.initializeWithMockData();

    // Set up event listener on CommentForm's onCommentSubmit
    document.addEventListener('comment-added', this.handleCommentAdded.bind(this), false);

    if (super.createdCallback) {
      super.createdCallback();
    }
  }

  initializeWithMockData() {
    const mockDownloadedData = [
      {author: 'Rob Bearman', commentText: 'Hey, Jan, make me a sandwich'},
      {author: 'Jan Miksovsky', commentText: 'Ok, Rob, you are now a sandwich'}
    ];

    this.store.dispatch({
      type: 'ADD_COMMENTS',
      comments: mockDownloadedData
    });
  }

  storeListener() {
    let newTree = this.render(this.store.getState());
    let patches = diff(this.tree, newTree);
    this.rootNode = patch(this.rootNode, patches);
    this.tree = newTree;
  }

  handleCommentAdded(e) {
    if (e.detail == null || e.detail === undefined) {
      return;
    }

    this.store.dispatch({
      type: 'ADD_COMMENTS',
      comments: [e.detail]
    });
  }

  render(state) {
    /* jshint ignore:start */
    return (
      <div id="commentBox">
        <h1>Comments</h1>
        <rwc-comment-list attributes={{"comment-data": JSON.stringify(state.commentList)}}></rwc-comment-list>
        <rwc-comment-form attributes={{style: "display: block; margin-top: 40px;"}}></rwc-comment-form>
      </div>
    );
    /* jshint ignore:end */
  }
}

document.registerElement('rwc-comment-box', CommentBox);
export default CommentBox;
