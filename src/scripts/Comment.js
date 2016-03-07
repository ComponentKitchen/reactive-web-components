import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
import {h} from 'virtual-dom'; // jshint ignore:line
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
      state = Comment.defaultState;
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
    // Initialize the component state and its Redux store.
    // Build the initial DOM root node and prepare for future virtual-dom patches.
    this.store = createStore(Comment.reducer);
    this.store.subscribe(this.storeListener.bind(this));
    this.tree = this.render(Comment.defaultState);
    this.rootNode = create(this.tree);
    this.appendChild(this.rootNode);

    //
    // At the time the Comment element is created, no children have yet been created.
    // Since the comment text is written to be a text child of <rwc-comment>, we need
    // to watch for that child to be added at which time we'll capture it as the comment
    // state value, then remove the child element from the DOM.
    //
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Watch for the addition of children nodes to <rwc-comment>, ignoring the component's initial local DOM.
        if (mutation.addedNodes.length > 0 &&
          mutation.addedNodes[0].id !== 'comment') {

          let commentText = mutation.addedNodes[0].textContent;

          // Remove the added nodes now that we've captured the comment.
          let nodeList = [].slice.call(mutation.addedNodes);
          nodeList.forEach((node) => {
            this.removeChild(node);
          });

          this.comment = commentText;
        }
      });
    });

    // Activate the MutationObserver
    this.observer.observe(this, {childList: true});

    //
    // The behavior of polyfill browsers differs from native (Chrome) in that at this
    // point, the TEXT childNode will exist under <rwc-comment>. Here, we take the
    // same action as we would in our MutationObserver above.
    //
    if (this.childNodes) {
      let arrayOfNodesToRemove = [];

      for (let i = 0; i < this.childNodes.length; i++) {
        let node = this.childNodes[i];

        if (node.id !== 'comment') {
          let commentText = node.textContent;
          // Collect the child nodes we need to remove
          arrayOfNodesToRemove.push(node);
          // Last one found wins - though typically we'd have only one child node
          this.comment = commentText;
        }
      }

      // Now blow away the child nodes from the DOM
      arrayOfNodesToRemove.forEach((node) => {
        this.removeChild(node);
      });
    }

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


