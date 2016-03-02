import {createStore} from 'redux';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';
import {h} from 'virtual-dom'; // jshint ignore:line
import ElementBase from 'basic-element-base/src/ElementBase';

class CommentForm extends ElementBase {

  static get defaultState() {
    return {
      author: '',
      commentText: ''
    };
  }

  static reducer(state, action) {
    if (action == null || action.type == null) {
      return state;
    }
    if (state == null) {
      state =CommentForm.defaultState;
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
    // Initialize the component state and its Redux store.
    // Build the initial DOM root node and prepare for future virtual-dom patches.
    this.store = createStore(CommentForm.reducer);
    this.state = CommentForm.defaultState;
    this.tree = this.render(CommentForm.defaultState);
    this.rootNode = create(this.tree);

    this.store.subscribe(this.storeListener.bind(this));

    this.appendChild(this.rootNode);

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

  set author(val) {
    this.store.dispatch({
      type: 'SET_AUTHOR',
      author: val.trim()
    });
  }
  get author() {
    return this.store.getState().author;
  }

  set commentText(val) {
    this.store.dispatch({
      type: 'SET_COMMENTTEXT',
      commentText: val.trim()
    });
  }
  get commentText() {
    return this.store.getState().commentText;
  }

  clearForm() {
    this.store.dispatch({
      type: 'CLEAR_FORM'
    });
  }

  handleAuthorChange(e) {
    // Trigger the SET_AUTHOR store dispatch
    this.author = e.target.value;
  }

  handleCommentTextChange(e) {
    // Triggger the SET_COMMENTTEXT store dispatch
    this.commentText = e.target.value;
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.commentText || !this.author) {
      return;
    }

    // Fire a custom event containing author/commentText data for listeners looking for a
    // newly added comment. Clear the form.
    let event = new CustomEvent('comment-added', {detail: {author: this.author, commentText: this.commentText}});
    document.dispatchEvent(event);

    this.clearForm();
    document.getElementById('authorInput').focus();
  }

  render(state) {
    /* jshint ignore:start */
    return (
      <form onsubmit={this.handleSubmit.bind(this)}>
        <input
          id="authorInput"
          type="text"
          placeholder="Your name"
          value={state.author}
          onchange={this.handleAuthorChange.bind(this)}
          autofocus
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
