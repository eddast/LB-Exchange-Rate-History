import * as React from 'react';
import LineChart from '../ui/LineChart';
import AddCurrency from './AddCurrency';
import CurrencyTable from '../ui/CurrencyTable';

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
  fatalError: boolean;
  activeComparions: string[];
}

export default class HistoricalExchangeRates extends React.Component <HistoricalExchangeRatesProps, HistoricalExchangeRatesState> {	
  
  private colors: any = [ '#194262', '#E91E63', '#4CAF50', '#009688', '#FF5722', '#607D8B', '#263238', '#F44336', '#2196F3', '#90A4AE', '#673AB7', '#3F51B5', '#FF5722', '#FF5722', '#9C27B0', '#FFEB3B', '#CDDC39', '#8BC34A'];

  /**
   * Initialize state and fetch currency options
   * Fetch ISK-EUR as default on start
   */
  componentWillMount(): void {
    const initialSourceCurrency = 'ISK', initialTargetCurrency = 'EUR';
    this.setState({
      data: [],
      currencyOptions: null,
      fatalError: false,
      activeComparions: []
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
    this.addGraph(initialSourceCurrency, initialTargetCurrency, sixMonthsBefore, today, ((success: boolean) => {
      if(!success) { this.setState({ fatalError: true}); }
    }));
  }

  pushBackColor(colorIdx: number): void {
    const color = this.colors[colorIdx];
		this.colors.splice(colorIdx, 1);
		this.colors.push(color);
	}

  /**
   * Adds a new graph to line chart for souce and target currency for a given peroid range (from-to)
   */
  addGraph(sourceCurrencyID: string, destCurrencyID: string, dateFrom: Date, dateTo: Date, cb: any){
    fetch(
      'https://api.landsbankinn.is/Securities/Currencies/v2/'
      + 'Currencies/' + sourceCurrencyID
      + '/Rates/' + destCurrencyID + '/History?'
      + 'source=general&from=' + this.toDateStr(dateFrom)
      + '&to=' + this.toDateStr(dateTo),
          { headers: new Headers({'apikey': 'gwY04Ac02i5Tk9Kqt6GYeHXshE2wjOB7', 'Accept-Language': 'is-IS'})}
    ).then(results => {
      cb(results.ok, results.status);
      if(!results.ok){
        return null;
      }
      return results.json();
    }).then(newGraphData => {
      if(newGraphData !== null) {
        this.state.data.push(newGraphData);
        this.state.activeComparions.push(destCurrencyID+'-'+sourceCurrencyID)
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
    this.state.activeComparions.splice(graphIdx, 1);
    let newData = this.state.data; let newComparisons = this.state.activeComparions;
    this.setState({ data: newData, activeComparions: newComparisons});
    this.pushBackColor(graphIdx);
  }
  
  /* Render data */
  render(): JSX.Element {
    if (this.state.fatalError) {
      return(
      <div className="app-container">
        <Logo />
        <h1 className="main-heading">Gengisþróun gjaldmiðla</h1>
        <div className="graph-container" style={{ textAlign: 'center', color: '#194262'}}>
          <h3>Ekki tókst að ræsa kerfi</h3>
          <p>Athugaðu tengingu og prófaðu að endurhlaða síðunni</p>
        </div>
      </div>
      );
    } else if (this.state.currencyOptions !== null && this.state.data.length !== 0) {
      return (
        <div className="app-container">
          <Logo />
          <h1 className="main-heading">Gengisþróun gjaldmiðla</h1>
          <div className="graph-container">
            <AddCurrency
              addGraph={(source: string, target: string, raiseError: any) => {
                let today = new Date();
                let sixMonthsBefore = new Date(); sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6);
                this.addGraph(source, target, sixMonthsBefore, today, raiseError);
              }}
              activeComparions={this.state.activeComparions}
              maximumExceeded={this.state.data.length-1 >= 14}
              currencies={this.state.currencyOptions}
            />
            <LineChart
              data={this.state.data}
              colors={this.colors}
              deleteGraph={(graphIdx: number) => this.deleteGraph(graphIdx)}
            />
            <CurrencyTable
              data={this.state.data}
              colors={this.colors}
              deleteComparison={(graphIdx: number) => this.deleteGraph(graphIdx)}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="app-container">
          <Logo />
          <h1 className="main-heading">Gengisþróun gjaldmiðla</h1>
          <div className="graph-container" style={{ textAlign: 'center', color: '#194262'}}>
            <h3>Sæki gögn...</h3>
            <div className="loader loader-large"/>
          </div>
        </div>
      );
    }
  }
}