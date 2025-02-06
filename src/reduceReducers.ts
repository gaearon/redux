import type { NoInfer } from './createStore'
import type { Action } from './types/actions'
import type { Reducer } from './types/reducers'

/**
 * Composes multiple reducers into one.
 *
 * @param initialState The initial state, which can be a different preloaded state.
 * @param reducer The first reducer. Can accept a different preloaded state.
 * @param reducers The rest of the reducers.
 * @returns A reducer function that invokes every reducer passed in order, and returns the result of the last reducer.
 */
export default function reduceReducers<
  S,
  A extends Action,
  Actions extends Action[],
  P
>(
  initialState: NoInfer<P | S> | undefined,
  reducer: Reducer<S, A, P>,
  ...reducers: {
    [K in keyof Actions]: Reducer<S, Actions[K]>
  }
): Reducer<S, A | Actions[number], P>
/**
 * Composes multiple reducers into one.
 *
 * @param reducer The first reducer. Can accept a different preloaded state.
 * @param reducers The rest of the reducers.
 * @returns A reducer function that invokes every reducer passed in order, and returns the result of the last reducer.
 */
export default function reduceReducers<
  S,
  A extends Action,
  Actions extends Action[],
  P
>(
  reducer: Reducer<S, A, P>,
  ...reducers: {
    [K in keyof Actions]: Reducer<S, Actions[K]>
  }
): Reducer<S, A | Actions[number], P>
export default function reduceReducers<S, A extends Action, P>(
  ...args: [P | S | undefined | Reducer<S, A, P>, ...Array<Reducer<S, A>>]
): Reducer<S, A, P> {
  const initialState =
    typeof args[0] === 'function'
      ? undefined
      : (args.shift() as P | S | undefined)
  const [firstReducer, ...restReducers] = args as [
    Reducer<S, A, P>,
    ...Reducer<S, A>[]
  ]
  return (state = initialState, action) =>
    restReducers.reduce(
      (state, reducer) => reducer(state, action),
      firstReducer(state, action)
    )
}
