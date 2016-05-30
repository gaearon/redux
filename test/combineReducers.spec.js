import expect from 'expect'
import { combineReducers } from '../src'
import createStore, { ActionTypes } from '../src/createStore'

describe('Utils', () => {
  describe('combineReducers', () => {
    it('returns a composite reducer that maps the state keys to given reducers', () => {
      const reducer = combineReducers({
        counters: {
          foo: (state = 0, action) =>
            action.type === 'increment_foo' ? state + 1 : state,
          bar: (state = 0, action) =>
            action.type === 'increment_bar' ? state + 1 : state
        },
        stack: (state = [], action) =>
          action.type === 'push' ? [ ...state, action.value ] : state
      })

      const s1 = reducer({}, { type: 'increment_foo' })
      expect(s1).toEqual({ counters: { foo: 1, bar: 0 }, stack: [] })

      const s2 = reducer(s1, { type: 'increment_bar' })
      expect(s2).toEqual({ counters: { foo: 1, bar: 1 }, stack: [] })
      
      const s3 = reducer(s2, { type: 'push', value: 'a' })
      expect(s3).toEqual({ counters: { foo: 1, bar: 1 }, stack: [ 'a' ] })
    })
    
    it('passes the top-level state to each reducer in the tree', () => {
      var reducers = {
        foo: {
          bar: () => { return {} }
        }
      }
      
      const spy = expect.spyOn(reducers.foo, 'bar').andCallThrough()
      const reducer = combineReducers(reducers)
      
      reducer({ foo: { bar: 0 } }, { type: 'QUX' })
      var lastCall = spy.calls[spy.calls.length - 1]
      expect(lastCall.arguments[0]).toEqual(0)
      expect(lastCall.arguments[1]).toEqual({ type: 'QUX' })
      expect(lastCall.arguments[2]).toEqual({ foo: { bar: 0 } })
    })
    
    it('can be chained and still correctly pass top-level state', () => {
      var subreducers = {
        bar : () => { return {} }
      }
      const spy = expect.spyOn(subreducers, 'bar').andCallThrough()
      
      var reducers = {
        foo: combineReducers(subreducers)
      }

      const rootReducer = combineReducers(reducers)
      rootReducer({ foo: { bar: 0 } }, { type: 'QUX' })
      var lastCall = spy.calls[spy.calls.length - 1]
      expect(lastCall.arguments[0]).toEqual(0)
      expect(lastCall.arguments[1]).toEqual({ type: 'QUX' })
      expect(lastCall.arguments[2]).toEqual({ foo: { bar: 0 } })
    })

    it('ignores all props which are not a function or a non-empty object', () => {
      const reducer = combineReducers({
        fake: true,
        broken: 'string',
        counters: { increment: (state = []) => state },
        stack: (state = []) => state
      })
      
      var stateKeys = Object.keys(reducer({ }, { type: 'push' }))
      expect(stateKeys.length).toEqual(2)
      expect(stateKeys).toInclude('counters')
      expect(stateKeys).toInclude('stack')
    })

    it('throws an error if a reducer returns undefined handling an action', () => {
      const reducer = combineReducers({
        counter(state = 0, action) {
          switch (action && action.type) {
            case 'increment':
              return state + 1
            case 'decrement':
              return state - 1
            case 'whatever':
            case null:
            case undefined:
              return undefined
            default:
              return state
          }
        }
      })

      expect(
        () => reducer({ counter: 0 }, { type: 'whatever' })
      ).toThrow(
      /"whatever".*"counter"/
      )
      expect(
        () => reducer({ counter: 0 }, null)
      ).toThrow(
      /"counter".*an action/
      )
      expect(
        () => reducer({ counter: 0 }, { })
      ).toThrow(
      /"counter".*an action/
      )
    })

    it('throws an error on first call if a reducer returns undefined initializing', () => {
      const reducer = combineReducers({
        counter(state, action) {
          switch (action.type) {
            case 'increment':
              return state + 1
            case 'decrement':
              return state - 1
            default:
              return state
          }
        }
      })
      expect(() => reducer({ })).toThrow(
        /"counter".*initialization/
      )
    })

    it('catches error thrown in reducer when initializing and re-throw', () => {
      const reducer = combineReducers({
        throwingReducer() {
          throw new Error('Error thrown in reducer')
        }
      })
      expect(() => reducer({ })).toThrow(
        /Error thrown in reducer/
      )
    })

    it('allows a symbol to be used as an action type', () => {
      const increment = Symbol('INCREMENT')

      const reducer = combineReducers({
        counter(state = 0, action) {
          switch (action.type) {
            case increment:
              return state + 1
            default:
              return state
          }
        }
      })

      expect(reducer({ counter: 0 }, { type: increment }).counter).toEqual(1)
    })

    it('maintains referential equality if the reducers it is combining do', () => {
      const reducer = combineReducers({
        foo: {
          child1(state = { }) {
            return state
          },
          child2(state = { }) {
            return state
          },
          child3(state = { }) {
            return state
          }
        }
      })

      const initialState = reducer(undefined, '@@INIT')
      expect(reducer(initialState, { type: 'FOO' })).toBe(initialState)
    })

    it('does not have referential equality if one of the reducers changes something', () => {
      const reducer = combineReducers({
        foo: {
          child1(state = { }) {
            return state
          },
          child2(state = { count: 0 }, action) {
            switch (action.type) {
              case 'increment':
                return { count: state.count + 1 }
              default:
                return state
            }
          },
          child3(state = { }) {
            return state
          }
        },
        bar: {
          child1(state = { }) {
            return state
          }
        }
      })

      const initialState = reducer(undefined, '@@INIT')
      const nextState = reducer(initialState, { type: 'increment' })
      expect(nextState).toNotBe(initialState)
      expect(nextState.foo).toNotBe(initialState.foo)
      expect(nextState.bar).toBe(initialState.bar)
    })

    it('throws an error on first call if a reducer attempts to handle a private action', () => {
      const reducer = combineReducers({
        counter(state, action) {
          switch (action.type) {
            case 'increment':
              return state + 1
            case 'decrement':
              return state - 1
            // Never do this in your code:
            case ActionTypes.INIT:
              return 0
            default:
              return undefined
          }
        }
      })
      expect(() => reducer()).toThrow(
        /"counter".*private/
      )
    })

    it('warns if no reducers are passed to combineReducers', () => {
      const spy = expect.spyOn(console, 'error')
      const reducer = combineReducers({ })
      reducer({ })
      expect(spy.calls[0].arguments[0]).toMatch(
        /Store does not have a valid reducer/
      )
      spy.restore()
    })

    it('warns if input state does not match reducer shape', () => {
      const spy = expect.spyOn(console, 'error')
      const reducer = combineReducers({
        foo: {
          bar(state = { baz: 1 }) {
            return state
          },
          qux(state = { corge: 3 }) {
            return state
          }
        }
      })

      reducer()
      expect(spy.calls.length).toBe(0)

      reducer({ 
        foo : { 
          bar: { baz: 2 }
        }
      })
      expect(spy.calls.length).toBe(0)

      reducer({
        foo: { 
          bar: { baz: 2 },
          qux: { corge: 4 }
        }
      })
      expect(spy.calls.length).toBe(0)

      createStore(reducer, { bar: 2 })
      expect(spy.calls[0].arguments[0]).toMatch(
        /Unexpected key "bar".*createStore.*instead: "foo"/
      )

      createStore(reducer, { bar: 2, qux: 4 })
      expect(spy.calls[1].arguments[0]).toMatch(
        /Unexpected keys "bar", "qux".*createStore.*instead: "foo"/
      )

      createStore(reducer, 1)
      expect(spy.calls[2].arguments[0]).toMatch(
        /createStore has unexpected type of "Number".*keys: "foo"/
      )

      reducer({ bar: 2 })
      expect(spy.calls[3].arguments[0]).toMatch(
        /Unexpected key "bar".*reducer.*instead: "foo"/
      )

      reducer({ bar: 2, qux: 4 })
      expect(spy.calls[4].arguments[0]).toMatch(
        /Unexpected keys "bar", "qux".*reducer.*instead: "foo"/
      )

      reducer(1)
      expect(spy.calls[5].arguments[0]).toMatch(
        /reducer has unexpected type of "Number".*keys: "foo"/
      )

      spy.restore()
    })
  })
})
