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

  reducer(state = defaultState, action = {type: 'SET_AUTHOR'}) {
    switch (action.type) {
      case 'SET_AUTHOR':
        return Object.assign(state, action.newState);

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
  // Note: The component remains stateless - no properties. Everything is managed in the Redux store.
  // So instead of using attribute marshalling to properties, we intercept the attributeChangedCallback
  // handled in the mixin, and dispatch an action to the store.
  //
  attributeChangedCallback(name, oldValue, newValue) {
    switch(name) {
      case 'author':
        this.store.dispatch({type: 'SET_AUTHOR', newState: {author: newValue}});
        break;

      default:
        break;
    }
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
    return h('div#comment', [ '\n  ', h('h2#commentAuthor', [ '\n' + this.store.getState().author + '\n  ' ]), '\n  ' ]);
  }
}

document.registerElement('rwc-comment', Comment);
export default Comment;


