import {h} from 'virtual-dom';
import {diff} from 'virtual-dom';
import {patch} from 'virtual-dom';
import {create} from 'virtual-dom';

import {store} from './reducer';

function render(count = 0) {
  return h("dev", [ h("h2", ["Content header"]), h("div", [ "Count = " + count ]) ]);
}

let count = 0;      // We need some app data. Here we just store a count.

let tree = render(count);               // We need an initial tree
let rootNode = create(tree);     // Create an initial root DOM node ...
let newTree;
let patches;

document.addEventListener('click', () => {
  store.dispatch({type: 'INCREMENT'});
});

store.subscribe(() => {
  newTree = render(store.getState());
  patches = diff(tree, newTree);
  rootNode = patch(rootNode, patches);
  tree = newTree;
});

document.addEventListener('DOMContentLoaded', () => {
  let contentElement = document.getElementById('contentDiv');
  contentElement.appendChild(rootNode);
});
