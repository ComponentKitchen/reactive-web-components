import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
/* jshint ignore:start */
import {h} from 'virtual-dom';
/* jshint ignore:end */
import ElementBase from 'basic-element-base/src/ElementBase';

class CommentForm extends ElementBase {

  static get defaultState() {
    return {
      author: '',
      commentText: ''
    };
  }

  reducer(state, action) {
    if (action == null || action.type == null) {
      return state;
    }
    if (state == null) {
      state = Object.assign({}, CommentForm.defaultState);
    }

    switch (action.type) {
      case 'CLEAR_FORM':
        return Object.assign({}, state, {author: '', commentText: ''});

      case 'SET_AUTHOR':
        return Object.assign({}, state, {author: action.author});

      case 'SET_COMMENTTEXT':
        return Object.assign({}, state, {commentText: action.commentText});

      default:
        return state;
    }
  }

  createdCallback() {
    if (super.createdCallback) {
      super.createdCallback();
    }

    this.store = createStore(this.reducer);
    this.state = Object.assign({}, CommentForm.defaultState);
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

  set author(val) {
    const action = {
      type: 'SET_AUTHOR',
      author: val.trim()
    };
    this.store.dispatch(action);
  }
  get author() {
    return this.store.getState().author;
  }

  set commentText(val) {
    const action = {
      type: 'SET_COMMENTTEXT',
      commentText: val.trim()
    };
    this.store.dispatch(action);
  }
  get commentText() {
    return this.store.getState().commentText;
  }

  clearForm() {
    const action = {
      type: 'CLEAR_FORM'
    };
    this.store.dispatch(action);
  }

  handleAuthorChange(e) {
    this.author = e.target.value;
  }

  handleCommentTextChange(e) {
    this.commentText = e.target.value;
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.commentText || !this.author) {
      return;
    }

    let event = new CustomEvent('onCommentFormSubmit', {detail: {author: this.author, commentText: this.commentText}});
    document.dispatchEvent(event);

    this.clearForm();
  }

  render(state = Object.assign({}, CommentForm.defaultState)) {
    /* jshint ignore:start */
    return (
      <form className="commentForm" onsubmit={this.handleSubmit.bind(this)}>
        <input
          type="text"
          placeholder="Your name"
          value={state.author}
          onchange={this.handleAuthorChange.bind(this)}
        />
        <input
          type="text"
          placeholder="Say something..."
          value={state.commentText}
          onchange={this.handleCommentTextChange.bind(this)}
        />
        <input type="submit" value="Post" />
      </form>
    );
    /* jshint ignore:end */
  }
}

document.registerElement('rwc-comment-form', CommentForm);
export default CommentForm;
