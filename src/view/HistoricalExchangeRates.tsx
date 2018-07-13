import * as React from 'react';
import LineChart from '../ui/LineChart';
import AddCurrency from './AddCurrency';
import CurrencyTable from '../ui/CurrencyTable';
import GraphChip from '../ui/GraphChip';
import { COLORS, MAXCOMPARISONS } from '../resources/constants';
import { ExchangeRateComparisonData, CurrencyOption } from '../resources/interfaces';
import DateRange from '../ui/DateRange';

/* BANNER FUNCTION: Returns SVG Landsbankinn logo (credits to Landsbankinn) */
const Banner = (): JSX.Element => {
  return (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
      <svg 
        width="34" 
        height="34" 
        viewBox="0 0 34 34"
        style={{ marginRight: '10%'}}
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
      <h2>Gengisþróun</h2>
    </span>
  );
};

/**
 * HISTORICALEXCHANGERATES COMPONENT
 * Root component - plots all functionality of app
 */
interface HistoricalExchangeRatesProps {
  
}
interface HistoricalExchangeRatesState {
  data: ExchangeRateComparisonData[];
  currencyOptions: CurrencyOption[];
  colors: string[];
  fatalError: boolean;
  activeComparions: string[];
  fromDate: Date;
  toDate: Date;
  loadingData: boolean;
}
export default class HistoricalExchangeRates extends React.Component <HistoricalExchangeRatesProps, HistoricalExchangeRatesState> {

  /* Initialize state and fetch currency options */
  componentWillMount(): void {
    const initialSourceCurrency = 'ISK', initialTargetCurrency = 'EUR';
    let today = new Date();
    let yearBeforeToday = new Date(); yearBeforeToday.setMonth(yearBeforeToday.getMonth() - 12);
    this.setState({
      data: [],
      currencyOptions: [],
      fatalError: false,
      activeComparions: [],
      colors: COLORS,
      fromDate: yearBeforeToday,
      toDate: today
    }, () => {
      fetch('https://api.landsbankinn.is/Securities/Currencies/v2/Currencies',
        { headers: new Headers({'apikey': 'gwY04Ac02i5Tk9Kqt6GYeHXshE2wjOB7', 'Accept-Language': 'is-IS'})}
      ).then(results => {
        return results.json();
      }).then(currencies => {
        this.setState({ currencyOptions: currencies });
      });
      this.addComparison(initialSourceCurrency, initialTargetCurrency, ((success: boolean) => {
        if(!success) { this.setState({ fatalError: true}); }
      }));
    });

  }

  /* resets color pallette when comparison cross is deleted */
  pushBackColor(colorIdx: number): void {
    const color = this.state.colors[colorIdx];
		this.state.colors.splice(colorIdx, 1);
    this.state.colors.push(color);
    let newColors = this.state.colors;
    this.setState({ colors: newColors });
	}

  /* adds a new comparison with specified source and target currency for a given peroid range (from-to) */
  addComparison(sourceCurrencyID: string, targetCurrencyID: string, cb: any){
    fetch(
      'https://api.landsbankinn.is/Securities/Currencies/v2/'
      + 'Currencies/' + sourceCurrencyID
      + '/Rates/' + targetCurrencyID + '/History?'
      + 'source=general&from=' + this.toDateStr(this.state.fromDate)
      + '&to=' + this.toDateStr(this.state.toDate),
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
        this.state.activeComparions.push(sourceCurrencyID+'-'+targetCurrencyID)
        let newData = this.state.data;
        this.setState({ data: newData });
      }
    });
  }

  /* Returns parameter date in a YYYY-MM-DD format */
  toDateStr(date: Date): string {
    return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
  }

  changeDateRange(fromDate: any, toDate: any): any {
    this.setState({ fromDate: fromDate, toDate: toDate, loadingData: true}, () => console.log(this.state));
    const responses = [];
    for(let i = 0; i < this.state.data.length; i++) {
      const elem = this.state.data[i];
      responses.push(fetch(
        'https://api.landsbankinn.is/Securities/Currencies/v2/'
        + 'Currencies/' + elem[0].quoteCurrency
        + '/Rates/' + elem[0].baseCurrency + '/History?'
        + 'source=general&from=' + this.toDateStr(fromDate)
        + '&to=' + this.toDateStr(toDate),
            { headers: new Headers({'apikey': 'gwY04Ac02i5Tk9Kqt6GYeHXshE2wjOB7', 'Accept-Language': 'is-IS'})}
      ));
    }
    const newData: ExchangeRateComparisonData[] = [];
    Promise.all(responses).then((values) => {
      for (let i = 0; i < values.length; i++) {
        values[i].json().then((data) => {
          newData.push(data);
          this.setState({data: newData, loadingData: false});
        });
      }
    });
  }

  /* Deletes a subgraph from the line chart */
  deleteGraph(graphIdx: number): void {
    this.state.data.splice(graphIdx, 1);
    this.state.activeComparions.splice(graphIdx, 1);
    let newData = this.state.data; let newComparisons = this.state.activeComparions;
    this.setState({ data: newData, activeComparions: newComparisons});
    this.pushBackColor(graphIdx);
  }
  
  /* Render app */
  render(): JSX.Element {
    /* error check in case of fatal error (:= unable to communicate with API) */
    if (this.state.fatalError) {
      return(
      <div className="app-container">
        <Banner />
        <div className="graph-container" style={{ textAlign: 'center', color: '#194262'}}>
          <h3>Ekki tókst að ræsa kerfi</h3>
          <p>Athugaðu tengingu og prófaðu að endurhlaða síðunni</p>
        </div>
      </div>
      );
    /* render data if at least one comparison has been fetched to be displayed */
    } else if (this.state.currencyOptions.length !== 0 && this.state.data.length !== 0) {
      return (
        <div className="app-container">
          <Banner />
          <div className="graph-container">
          <span className="add-and-chips-container">
            <span className="add-chips-func">
              <AddCurrency
                addComparison={(source: string, target: string, raiseError: any) => {
                  this.addComparison(source, target, raiseError);
                }}
                activeComparions={this.state.activeComparions}
                maximumExceeded={this.state.data.length >= MAXCOMPARISONS}
                currencies={this.state.currencyOptions}
              />
            </span>
            <span className="graph-chips">
              { this.state.activeComparions.map((comparisonID: any, idx: any) =>
                <GraphChip
                  key={idx}
                  title={comparisonID}
                  color={ this.state.colors[idx % this.state.colors.length] }
                  last={this.state.activeComparions.length===1}
                  onDelete={() => this.deleteGraph(idx)}
                />
              )}
            </span>
          </span>
            <DateRange
              changeDateRange={(to: Date, from: Date) => this.changeDateRange(to,from)}
              toDate={this.state.toDate}
              fromDate={this.state.fromDate}
            />
            <span className={'data-span'}>
              {this.state.loadingData ? <div className="overlap"><div className="loader loader-large"/></div> : null}
              <LineChart
                data={this.state.data}
                colors={this.state.colors}
                deleteGraph={(graphIdx: number) => this.deleteGraph(graphIdx)}
              />
              <CurrencyTable
                data={this.state.data}
                colors={this.state.colors}
                deleteComparison={(graphIdx: number) => this.deleteGraph(graphIdx)}
              />
            </span>
          </div>
        </div>
      );
    /* return loading state */
    } else {
      return (
        <div className="app-container">
          <Banner />
          <div className="graph-container content-not-loaded" style={{ textAlign: 'center', color: '#194262'}}>
            <h2>Sæki gögn...</h2>
            <div className="loader loader-large"/>
          </div>
        </div>
      );
    }
  }
}