import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
import {h} from 'virtual-dom'; // jshint ignore:line
import AttributeMarshalling from 'basic-component-mixins/src/AttributeMarshalling';

// Feature detection for old Shadow DOM v0.
// From ShadowTemplate.js
const USING_SHADOW_DOM_V0 = (typeof HTMLElement.prototype.createShadowRoot !== 'undefined');

class Comment extends AttributeMarshalling(HTMLElement) {

  static get defaultState() {
    return {
      author: ''
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

  //
  // The Comment component's host (in the demo case, CommentList),
  // can supply a light DOM tree that will display through the
  // <content> element -- soon to be <slot>.
  //
  render(state) {
    // Render the local dom for the component
    /* jshint ignore:start */
    return (
      <div id="comment">
        <h2 id="commentAuthor">
          {state.author}
        </h2>
        <content></content>
      </div>
    );
    /* jshint ignore:end */
  }
}

document.registerElement('rwc-comment', Comment);
export default Comment;


