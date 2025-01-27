// functions
import { createStore, legacy_createStore } from './createStore'
import combineReducers from './combineReducers'
import reduceReducers from './reduceReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'
import isAction from './utils/isAction'
import isPlainObject from './utils/isPlainObject'
import __DO_NOT_USE__ActionTypes from './utils/actionTypes'

// types
// store
export type {
  Dispatch,
  Unsubscribe,
  Observable,
  Observer,
  Store,
  StoreCreator,
  StoreEnhancer,
  StoreEnhancerStoreCreator
} from './types/store'
// reducers
export type {
  Reducer,
  ReducersMapObject,
  StateFromReducersMapObject,
  ReducerFromReducersMapObject,
  ActionFromReducer,
  ActionFromReducersMapObject,
  PreloadedStateShapeFromReducersMapObject
} from './types/reducers'
// action creators
export type { ActionCreator, ActionCreatorsMapObject } from './types/actions'
// middleware
export type { MiddlewareAPI, Middleware } from './types/middleware'
// actions
export type { Action, UnknownAction, AnyAction } from './types/actions'

export {
  createStore,
  legacy_createStore,
  combineReducers,
  reduceReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  isAction,
  isPlainObject,
  __DO_NOT_USE__ActionTypes
}
