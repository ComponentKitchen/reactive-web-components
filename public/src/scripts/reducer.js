import {createStore} from 'redux';

const counter = (state = 0, action = 'INCREMENT') => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;

    case 'DECREMENT':
      return state - 1;

    default:
      return state;
  }
};

const store = createStore(counter);

exports.store = store;
