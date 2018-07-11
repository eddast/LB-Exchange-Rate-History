/* =======================================================================
 *    Exchange rate history visualizer for multiple currency comparisons
 *    Implemented for Landsbankinn 13. JUL 2018
 *    Data fetched from Landsbankinn's API services
 *    Author: Edda Steinunn Rúnarsdóttir
 * =======================================================================*/

import * as React from 'react';
import HistoricalExchangeRates from './HistoricalExchangeRates';
import { Switch, Route, withRouter } from 'react-router-dom';

interface AppState {}; interface AppProps {};
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