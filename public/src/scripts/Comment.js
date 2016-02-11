import {createStore} from 'redux';
import {h} from 'virtual-dom';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
import ElementBase from 'basic-element-base/src/ElementBase';

const defaultState = {
  author: ''
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

      default:
        return state;
    }
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
    /*
    <div id="comment">
      <h2 id="commentAuthor">
        {this.store.getState().author}
      </h2>
      {content}
    </div>
     */
    // BUGBUG - Use JSX and convert to h calls
    return h('div#comment', [ '\n  ', h('h2#commentAuthor', [ '\n' + this.store.getState().author + '\n  ' ]), '\n  ' ]);
  }
}

document.registerElement('rwc-comment', Comment);
export default Comment;


