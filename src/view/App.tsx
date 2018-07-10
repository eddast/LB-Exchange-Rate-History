import * as React from 'react';
import HistoricalExchangeRates from './HistoricalExchangeRates';
import { Switch, Route, withRouter } from 'react-router-dom';

interface AppState {};
interface AppProps {};

export class App extends React.Component <AppProps, AppState> {

  public render() {
    const paths = (
        <Switch>
            <Route exact path='/' component={HistoricalExchangeRates} />
        </Switch>
    );
    return paths;
  }
}

export default withRouter(App as any);