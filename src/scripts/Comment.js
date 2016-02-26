import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
/* jshint ignore:start */
import {h} from 'virtual-dom';
/* jshint ignore:end */
import ElementBase from 'basic-element-base/src/ElementBase';

class Comment extends ElementBase {

  static get defaultState() {
    return {
      author: '',
      comment: ''
    };
  }

  static reducer(state, action) {
    if (action == null || action.type == null) {
      return state;
    }
    if (state == null) {
      state = Object.assign({}, Comment.defaultState);
    }
    switch (action.type) {
      case 'SET_AUTHOR':
        return Object.assign({}, state, {author: action.author});

      case 'SET_COMMENT':
        return Object.assign({}, state, {comment: action.comment});

      default:
        return state;
    }
  }

  createdCallback() {
    if (super.createdCallback) {
      super.createdCallback();
    }

    // Initialize the component state and its Redux store.
    // Build the initial DOM root node and prepare for future virtual-dom patches.
    this.store = createStore(Comment.reducer);
    this.state = Object.assign({}, Comment.defaultState);
    this.tree = this.render(this.state);
    this.rootNode = create(this.tree);

    //
    // At the time the Comment element is created, no children have yet been created.
    // Since the comment text is written to be a text child of <rwc-comment>, we need
    // to watch for that child to be added at which time we'll capture it as the comment
    // state value, then remove the child element from the DOM.
    //
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Watch for the addition of children nodes to <rwc-comment>, ignoring the component's initial local DOM.
        if (mutation.type == 'childList' &&
          mutation.addedNodes.length > 0 &&
          mutation.addedNodes[0].id !== 'comment') {

          let node = mutation.addedNodes[0];
          let commentText = node.textContent;

          // Remove the added nodes now that we've captured the comment.
          // Note that we can't use map() here as NodeList is not an array.
          let nodeList = mutation.addedNodes;
          for (let i = 0; i < nodeList.length; i++) {
            this.removeChild(nodeList[i]);
          }

          this.comment = commentText;
        }
      });
    });

    // Activate the MutationObserver
    this.observer.observe(this, {childList: true});

    // Subscribe to change notifications to the Redux store
    this.store.subscribe(this.storeListener.bind(this));

    // Attach the new local dom to the <rwc-comment> element
    this.appendChild(this.rootNode);
  }

  storeListener() {
    let newTree = this.render(this.store.getState());
    let patches = diff(this.tree, newTree);
    this.rootNode = patch(this.rootNode, patches);
    this.tree = newTree;
  }

  //
  // This property setter/getter takes advantage of the AttributeMarshalling mixin.
  // Note that we don't store properties as class state, but rather via the component's
  // Redux store.
  //
  set author(author) {
    this.store.dispatch({
      type: 'SET_AUTHOR',
      author: author
    });
  }
  get author() {
    return this.store.getState().author;
  }

  set comment(commentText) {
    this.store.dispatch({
      type: 'SET_COMMENT',
      comment: commentText
    });
  }
  get comment() {
    return this.store.getState().comment;
  }

  render(state) {
    // Render the local dom for the component
    /* jshint ignore:start */
    return (
      <div id="comment">
        <h2 id="commentAuthor">
          {state.author}
        </h2>
        {state.comment}
      </div>
    );
    /* jshint ignore:end */
  }
}

document.registerElement('rwc-comment', Comment);
export default Comment;


