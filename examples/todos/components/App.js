import React, {Component} from 'react'
import { connect } from 'react-redux'
import {Footer} from './Footer'
import AddTodo from './AddTodo'
import { actions, store } from '../actions'
import { todos } from "../actions/Todos"
import { Link } from './Link'
import {TodoList} from './TodoList'
import {TodoFactory} from './TodoFactory'
import autobind from 'autobind-decorator'

@autobind
class App extends Component {
  constructor(props) {
    super(props)
    this._todoFactory = new TodoFactory(actions.toggleTodo)
  }

  render() {
    console.log(this.props.visibleTodos)
    return(
      <div>
        <AddTodo onAddTodo={actions.addTodo} />
        <TodoList
          todos={this.props.visibleTodos}
          todoFactory={this._todoFactory} >
        </TodoList>
        <Footer>
          <Link
            {...this._linkProps("SHOW_ALL")} >
            All
          </Link>
          {", "}
          <Link
            {...this._linkProps("SHOW_ACTIVE")} >
            Active
          </Link>
          {", "}
          <Link
            {...this._linkProps("SHOW_COMPLETED")} >
            Completed
          </Link>
        </Footer>
      </div>
    )
  }

  _linkProps(filter) {
    return {
      shouldActive: filter === store.visibilityFilter,
      onLinkClick: () => actions.setVisibilityFilter(filter)
    }
  }
}

const mapStateToProps = (state) => {
  return {
    visibleTodos: todos.visibleOnes()
  }
}

const AppContainer = connect(
    mapStateToProps
)(App)

export default AppContainer
