import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
/* jshint ignore:start */
import {h} from 'virtual-dom';
/* jshint ignore:end */
import ElementBase from 'basic-element-base/src/ElementBase';

const defaultState = {
  author: '',
  comment: ''
};

class Comment extends ElementBase.compose() {

  reducer(state, action) {
    if (action == null || action.type == null) {
      return state;
    }
    if (state == null) {
      state = defaultState;
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

    this.store = createStore(this.reducer);
    this.state = defaultState;
    this.tree = this.render(this.state);
    this.rootNode = create(this.tree);
    this.newTree = {};
    this.patches = {};

    //
    // At the time the Comment element is created, no children have yet been created.
    // Since the comment text is written to be a text child of <rwc-comment>, we need
    // to watch for that child to be added at which time we'll capture it as the comment
    // state value, then remove the child element from the DOM.
    //
    // BUGBUG: Think about how we use entirely virtual dom approaches to address updating
    // the DOM without having to use parentNode.removeChild. The state of the virtual dom
    // ideally should cause a full render, eliminating the text child as part of the patch.
    //
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Watch for the addition of any children NOT including the div#comment local dom element.
        // That is, watch for the addition of light dom elements.
        if (mutation.type == 'childList' && mutation.addedNodes.length > 0 && mutation.addedNodes[0].id !== 'comment') {
          let node = mutation.addedNodes[0];

          // We fetch the textContent of the (assumed) text element child, update state
          // with the comment, then remove the text element from the DOM. Our
          // next render will update the virtual DOM, with the DOM patching to follow.

          // BUGBUG - need action router
          const action = {
            type: 'SET_COMMENT',
            comment: node.textContent
          };

          // BUGBUG - assumption here is a single TEXT node child
          node.parentNode.removeChild(node);

          this.store.dispatch(action);
        }
      });
    });

    this.observer.observe(this, {childList: true});

    this.store.subscribe(this.storeListener.bind(this));

    this.appendChild(this.rootNode);
  }

  storeListener() {
    this.newTree = this.render(this.store.getState());
    this.patches = diff(this.tree, this.newTree);
    this.rootNode = patch(this.rootNode, this.patches);
    this.tree = this.newTree;
  }

  //
  // This property setter/getter takes advantage of the AttributeMarshalling mixin.
  // Note that we don't store properties as class state, but rather via the component's
  // Redux store.
  //
  set author(author) {
    const action = {
      type: 'SET_AUTHOR',
      author: author
    };
    this.store.dispatch(action);
  }
  get author() {
    return this.store.getState().author;
  }

  render(state = {}) {
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


