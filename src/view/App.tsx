/* =======================================================================
 *    Exchange rate history visualizer for multiple currency comparisons
 *    Implemented for Landsbankinn 13. JUL 2018
 *    Data fetched from Landsbankinn's API services
 *    Author: Edda Steinunn Rúnarsdóttir
 * =======================================================================*/

import * as React from 'react';
import HistoricalExchangeRates from './HistoricalExchangeRates';

interface AppState {}; interface AppProps {};
export class App extends React.Component <AppProps, AppState> {
  public render() {
    return <HistoricalExchangeRates/>;
  }
}

export default App;