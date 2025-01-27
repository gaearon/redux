---
id: reducereducers
title: reduceReducers
hide_title: true
description: 'API > reduceReducers: running multiple reducers on the same state'
---

&nbsp;

# `reduceReducers(initialState, ...reducers)`

## Overview

The `reduceReducers` helper function composes multiple reducer functions into one. It runs each reducer in sequence, passing the result of each to the next, and returns the final result.

For example, you might want a base reducer built using [`combineReducers`](./combineReducers), but then also include some logic that requires the full combined state.

```js
const combinedReducer = combineReducers({
  counter: counterReducer,
  todos: todosReducer
})

const rootReducer = reduceReducers(combinedReducer, otherTopLevelFeatureReducer)
// or
const rootReducer = reduceReducers(
  { counter: 0, todos: [] },
  combinedReducer,
  otherTopLevelFeatureReducer
)
```

## Arguments

1. `initialState` (_any_): The initial state. This can also be the preloaded state for the reducer. This can also be omitted, and the first reducer's initial state will be used instead.

2. `...reducers` (_Function_): A set of reducer functions that need to be composed into one.

## Returns

(_Function_): A reducer that invokes every reducer passed in order, and returns the result of the last reducer.

## Example

#### `reducers/todos.js`

```js
export default function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text])
    default:
      return state
  }
}
```

#### `reducers/counter.js`

```js
export default function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
```

#### `reducers/otherTopLevelFeature.js`

```js
export default function otherTopLevelFeature(
  state = { counter: 0, todos: [] },
  action
) {
  switch (action.type) {
    case 'COUNT_TODOS':
      return {
        ...state,
        counter: state.todos.length
      }
    default:
      return state
  }
}
```

#### `reducers/index.js`

```js
import { combineReducers, reduceReducers } from '@reduxjs/toolkit'
import todos from './todos'
import counter from './counter'
import otherTopLevelFeature from './otherTopLevelFeature'

export default reduceReducers(
  combineReducers({
    counter,
    todos
  }),
  otherTopLevelFeature
)
```

#### `App.js`

```js
import { configureStore } from '@reduxjs/toolkit'
import reducer from './reducers/index'

const store = configureStore({
  reducer
})
console.log(store.getState())
// {
//   counter: 0,
//   todos: []
// }

store.dispatch({
  type: 'ADD_TODO',
  text: 'Use Redux'
})
console.log(store.getState())
// {
//   counter: 0,
//   todos: [ 'Use Redux' ]
// }

store.dispatch({
  type: 'COUNT_TODOS'
})
console.log(store.getState())
// {
//   counter: 1,
//   todos: [ 'Use Redux' ]
// }
```

## Tips

- You may call `reduceReducers` at any level of the reducer hierarchy. It doesn't have to happen at the top. In fact you may use it again to split the child reducers that get too complicated into independent grandchildren, and so on.
