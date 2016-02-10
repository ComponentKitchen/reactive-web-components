/*
var Comment = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className="comment">
      <h2 className="commentAuthor">
      {this.props.author}
    </h2>
    <span dangerouslySetInnerHTML={this.rawMarkup()} />
    </div>
    );
  }
});
*/

import h from 'virtual-dom';
//import diff from 'virtual-dom';
//import patch from 'virtual-dom';
//import create from 'virtual-dom';
import ElementBase from 'basic-element-base/src/ElementBase';

class Comment extends ElementBase.compose() {
  render(state = {}) {
    return h('div#comment', [ '\n  Hello, world! I am a Comment.\n' ]);
  }

}

document.registerElement('rwc-comment', Comment);
export default Comment;
