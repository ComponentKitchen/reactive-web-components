import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
import {h} from 'virtual-dom'; // jshint ignore:line

// Feature detection for old Shadow DOM v0.
// From ShadowTemplate.js
const USING_SHADOW_DOM_V0 = (typeof HTMLElement.prototype.createShadowRoot !== 'undefined');

class CommentList extends HTMLElement {

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
      state = CommentList.defaultState;
    }

    switch (action.type) {
      // Copy the previous state, and append the new comments
      // to the end of the commentList array.
      case 'ADD_COMMENTS_FROM_ATTRIBUTES':
        let newState = state.deepCopy();
        action.comments.forEach((comment) => {
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
    this.store = createStore(CommentList.reducer);
    this.store.subscribe(this.storeListener.bind(this));
    this.tree = this.render(CommentList.defaultState);
    this.rootNode = create(this.tree);

    let sRoot = USING_SHADOW_DOM_V0 ?
      this.createShadowRoot() :
      this.attachShadow({mode: 'open'});
    sRoot.appendChild(this.rootNode);

    if (super.createdCallback) {
      super.createdCallback();
    }
  }

  storeListener() {
    let newTree = this.render(this.store.getState());
    let patches = diff(this.tree, newTree);
    this.rootNode = patch(this.rootNode, patches);
    this.tree = newTree;
  }

  set commentData(json) {
    // virtual-dom sends us a patch json map, converted
    // from the commentData array we send in the CommentBox render JSX.
    // Here, we convert that map to an array for our dispatch call.
    let arrayComments = [];
    for (let key in json) {
      arrayComments.push(json[key]);
    }
    this.store.dispatch({
      type: 'ADD_COMMENTS_FROM_ATTRIBUTES',
      comments: arrayComments
    });
  }
  get commentData() {
    return this.store.getState().commentList;
  }

  render(state) {
    /* jshint ignore:start */
    let commentNodes = state.commentList.map((comment) => {
      return (
        <rwc-comment author={comment.author}>
          <div id="commentText">
            {comment.commentText}
          </div>
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
