import * as React from 'react';
import LineChart from '../ui/LineChart';
import AddCurrency from './AddCurrency';

/**
 * LOGO COMPONENT: Displays banner and logo, credits to Landsbankinn
 */
const Logo = (): JSX.Element => {
  return (
    <svg 
      width="34" 
      height="34" 
      viewBox="0 0 34 34" 
      xmlns="http://www.w3.org/2000/svg"
      style={{display: "block", marginLeft: "auto", marginRight: "auto" }}
    >
      <title>Landsbankinn</title>
      <path 
        d="M0 33.116c1.582-.507 3.114-1.97 3.874-4.38.632-2.016 7.25-22.687 7.9-24.783.656-2.096 
        2.402-3.88 5.077-3.926C19.53-.02 29.62.007 31.68.02c-3.03.2-4.387 1.64-5.38 4.673-.757
        2.305-6.762 21.082-7.736 24.41-.973 3.317 3.26 4.464 4.232 1.402.612-1.907 5.462-16.516 
        5.462-16.516s4.71 13.856 5.318 15.69c.53 1.613-.257 3.424-2.747 3.436 0 0-28.633-.048-30.83 0z" 
        fill="#FFF"
      />
    </svg>
  );
};

interface HistoricalExchangeRatesProps {}
interface HistoricalExchangeRatesState {
  data: any;
  currencyOptions: any;
}

export default class HistoricalExchangeRates extends React.Component <HistoricalExchangeRatesProps, HistoricalExchangeRatesState> {	
  
  /**
   * Initialize state and fetch currency options
   * Fetch ISK-EUR as default on start
   */
  componentWillMount(): void {
    this.setState({
      data: [],//[[97,92,89,30,72],[43,62,84,98,3],[23,88,52,14,4],[76,9,1,67,84],[56,89,13,7,24]],//,[61,56,7,87,13],[36,89,15,19,24],[5,9,28,17,4],[45,29,8,7,4],[52,94,81,72,42],[18,4,31,22,22],[2,9,1,2,2],[52,44,58,46,42],[33,64,22,12,2],[82,104,64,98,80]],
      currencyOptions: null
    });
    fetch('https://api.landsbankinn.is/Securities/Currencies/v2/Currencies',
          { headers: new Headers({'apikey': 'gwY04Ac02i5Tk9Kqt6GYeHXshE2wjOB7', 'Accept-Language': 'is-IS'})}
    ).then(results => {
      return results.json();
    }).then(currencies => {
      this.setState({ currencyOptions: currencies });
    });
    let today = new Date();
    let sixMonthsBefore = new Date(); sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6);
    this.addGraph('ISK', 'EUR', sixMonthsBefore, today, () => {}); // TODO ERROR
  }

  /**
   * Adds a new graph to line chart for souce and target currency for a given peroid range (from-to)
   */
  addGraph(sourceCurrencyID: string, destCurrencyID: string, dateFrom: Date, dateTo: Date, raiseError: any){
    fetch(
      'https://api.landsbankinn.is/Securities/Currencies/v2/'
      + 'Currencies/' + sourceCurrencyID
      + '/Rates/' + destCurrencyID + '/History?'
      + 'source=general&from=' + this.toDateStr(dateFrom)
      + '&to=' + this.toDateStr(dateTo),
          { headers: new Headers({'apikey': 'gwY04Ac02i5Tk9Kqt6GYeHXshE2wjOB7', 'Accept-Language': 'is-IS'})}
    ).then(results => {
      if(!results.ok){
        raiseError(results.status);
        return null;
      }
      return results.json();
    }).then(newGraphData => {
      if(newGraphData !== null) {
        this.state.data.push(newGraphData);
        let newData = this.state.data;
        this.setState({ data: newData });
      }
    });
  }

  /**
   * Returns parameter date in a YYYY-MM-DD format
   */
  toDateStr(date: Date): string {
    return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
  }

  /**
   * Deletes a subgraph from the line chart
   */
  deleteGraph(graphIdx: number): void {
    this.state.data.splice(graphIdx, 1);
    let newData = this.state.data;
    this.setState({ data: newData });
  }
  
  /* Render data */
  render(): JSX.Element {
    if(this.state.currencyOptions !== null && this.state.data.length !== 0) {
      return (
        <div className="app-container">
          {/* <Logo />
          <h1 className="main-heading">Gengisþróun gjaldmiðla</h1> */}
          <div className="graph-container">
            <AddCurrency
              addGraph={(source: string, target: string, raiseError: any) => {
                let today = new Date();
                let sixMonthsBefore = new Date(); sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6);
                this.addGraph(source, target, sixMonthsBefore, today, raiseError);
              }}
              maximumExceeded={this.state.data.length-1 >= 14}
              currencies={this.state.currencyOptions}
            />
            <LineChart
              data={this.state.data}
              deleteGraph={(graphIdx: number) => this.deleteGraph(graphIdx)}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="app-container">
          <Logo />
          <h1 className="main-heading">Gengisþróun gjaldmiðla</h1>
          <div className="graph-container">
            <h3 style={{ textAlign: 'center', color: 'black'}}>Sæki gögn...</h3>
          </div>
        </div>
      );
    }
  }
}