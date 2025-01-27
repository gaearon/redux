import { reduceReducers } from 'redux'

describe('Utils', () => {
  describe('reduceReducers', () => {
    const incrementReducer = (state = 0, action: { type: 'increment' }) =>
      action.type === 'increment' ? state + 1 : state
    const decrementReducer = (state = 0, action: { type: 'decrement' }) =>
      action.type === 'decrement' ? state - 1 : state

    it('runs multiple reducers in sequence and returns the result of the last one', () => {
      const combined = reduceReducers(incrementReducer, decrementReducer)
      expect(combined(0, { type: 'increment' })).toBe(1)
      expect(combined(1, { type: 'decrement' })).toBe(0)
    })
    it('accepts an initial state argument', () => {
      const combined = reduceReducers(2, incrementReducer, decrementReducer)
      expect(combined(undefined, { type: 'increment' })).toBe(3)
    })
    it('can accept the preloaded state of the first reducer', () => {
      const parserReducer = (state: number | string = 0) =>
        typeof state === 'string' ? parseInt(state, 10) : state

      const combined = reduceReducers(parserReducer, incrementReducer)
      expect(combined('1', { type: 'increment' })).toBe(2)

      const combined2 = reduceReducers('1', parserReducer, incrementReducer)
      expect(combined2(undefined, { type: 'increment' })).toBe(2)
    })
    it('accepts undefined as initial state', () => {
      const combined = reduceReducers(undefined, incrementReducer)
      expect(combined(undefined, { type: 'increment' })).toBe(1)
    })
  })
})
