import * as React from 'react';

interface AddCurrencyProps {
  maximumExceeded: boolean; 
  currencies: any;
  addGraph: any;
  activeComparions: any;
}
interface AddCurrencyState {
  sourceCurrency: any;
  destCurrency: any;
  errorMessage: any;
  isAdding: boolean;
}

export default class AddCurrency extends React.Component <AddCurrencyProps, AddCurrencyState> {

  componentWillMount(): void {
    const { currencies } = this.props;
    let sourceCurrency = currencies[0];
    for(let i = 0; i < currencies.length; i++) {
      if(currencies[i].id === 'ISK') {
        sourceCurrency = currencies[i].id
        break;
      }
    }
    this.setState({
      sourceCurrency: sourceCurrency,
      destCurrency: '',
      errorMessage: '',
      isAdding: false
    });
  }
  addCurrency(): void {
    const { sourceCurrency, destCurrency } = this.state;
    const compCrossValid = this.invalidSelect();
    if (compCrossValid.error) {
      this.setState({ errorMessage: compCrossValid.reasonPhrase});
    } else {
      this.setState({ errorMessage: '', isAdding: true});
      this.props.addGraph(sourceCurrency, destCurrency, ((success: boolean, status: number) => {
        if(!success) {
          this.setState({
            errorMessage: status === 404 ?
            status + ': Samanburðargengisþróun fyrir valda gjaldmiðla finnst ekki í gagnagrunni' :
            status + ': Eitthvað fór úrskeiðis við að sækja gögn úr gagnagrunni, vinsamlegast athugaðu tengingu',
            isAdding: false
          });
        } else { this.setState({ isAdding: false }); }
      }));
    }
  }
  invalidSelect(): any {
    const { sourceCurrency, destCurrency } = this.state;
    const { maximumExceeded } = this.props;
    if (sourceCurrency === destCurrency ) {
      return {
        error: true,
        reasonPhrase: 'Vinsamlegast veldu mismunandi gjaldmiðla í báða reiti'
      };
    } else if (destCurrency === '') {
      return {
        error: true,
        reasonPhrase: 'Vinsamlegast veldu gjaldmiðil í báða reiti'
      };
    } else if (this.props.activeComparions.includes(sourceCurrency+'-'+destCurrency)) {
      return {
        error: true,
        reasonPhrase: 'Samanburður þessa gjaldmiðla þegar valinn'
      }
    } else if(maximumExceeded) {
      return {
        error: true,
        reasonPhrase: 'Of margir samanburðir virkir, fjarlægðu einn eða fleiri til að bæta við nýjum gengissamanburð'
      }
    } else {
      return {
        error: false
      }
    }
  }
  render(): JSX.Element {
    const { currencies } = this.props;
    const error = this.invalidSelect().error;
    return(
      <div>
        <div className='add-currency-options'>
          <select
            className='currency-select'
            id='source-currency'
            value={this.state.sourceCurrency}
            onClick={() => this.setState({ errorMessage: ''})}
            onChange={(e: any) => this.setState({sourceCurrency: e.target.value}) }
          >
            { currencies.map((currency: any, i: any) =>
              <option key={i} value={currency.id}>{currency.id}: {currency.name}</option>
            )} 
          </select>
          <p>|</p>
          <select
            className='currency-select'
            id='target-currency'
            onClick={() => this.setState({ errorMessage: ''})}
            value={this.state.destCurrency}
            onChange={(e: any) => this.setState({destCurrency: e.target.value}) }
          >
            <option value={''}>Veldu mynt</option>
            { currencies.map((currency: any, i: any) =>
              <option key={i} value={currency.id}>{currency.id}: {currency.name}</option>
            )} 
          </select>
          {this.state.isAdding ?
            <div className="loader loader-small"/>
            :
            <div
              className="small-gray-btn"
              style={{ backgroundColor:  error ? '' : '#194262', color: error ? '' : 'white', padding: '5px'}}
              onClick={() => this.addCurrency()}
            >
              +
            </div>
          }
        </div>
        <p style={{ height: '10px', margin: '7px 0', fontSize: '10px', textAlign: 'center', color: 'red' }}>
          {this.state.errorMessage}
        </p>
      </div>
    );
  }
}