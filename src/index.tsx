import { Provider } from 'react-redux';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./view/App";
import { createStore, applyMiddleware } from 'redux';
import reducers from './reducers/reducers';
import thunk from 'redux-thunk';
import './styles/mainTheme.css';

const store = createStore(reducers, applyMiddleware(thunk));

ReactDOM.render(
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>,
  document.getElementById("root")
);