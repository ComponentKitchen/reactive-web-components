import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
/* jshint ignore:start */
import {h} from 'virtual-dom';
/* jshint ignore:end */
import ElementBase from 'basic-element-base/src/ElementBase';

class CommentList extends ElementBase {

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

  reducer(state, action) {
    if (action == null || action.type == null) {
      return state;
    }
    if (state == null) {
      state = CommentList.defaultState.deepCopy();
    }

    switch (action.type) {
      case 'ADD_COMMENTS_FROM_ATTRIBUTES':
        // Because comment data originates in attributes, we start with
        // the default state each time.
        let newState = CommentList.defaultState.deepCopy();
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

    this.store = createStore(this.reducer);
    this.state = CommentList.defaultState.deepCopy();
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

  set commentData(json) {
    let arrayComments = JSON.parse(json);
    const action = {
      type: 'ADD_COMMENTS_FROM_ATTRIBUTES',
      comments: arrayComments
    };
    this.store.dispatch(action);
  }
  get commentData() {
    return this.store.getState().commentList;
  }

  render(state = CommentList.defaultState.deepCopy()) {
    /* jshint ignore:start */
    let commentNodes = state.commentList.map((comment) => {
      return (
        <rwc-comment attributes={{author: comment.author, key: comment.key}}>
          {comment.commentText}
        </rwc-comment>
      );
    });

    return (
      <div id="commentList">
        {commentNodes}
      </div>
    );
    /* jshint ignore:end */
  }
}

document.registerElement('rwc-comment-list', CommentList);
export default CommentList;
