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
    const { maximumExceeded } = this.props;
    if (sourceCurrency === destCurrency ) {
      this.setState({ errorMessage: 'Vinsamlegast veldu mismunandi gjaldmiðla í báða reiti'});
    } else if (destCurrency === '') {
      this.setState({ errorMessage: 'Vinsamlegast veldu gjaldmiðil í báða reiti'});
    } else if (this.props.activeComparions.includes(destCurrency+'-'+sourceCurrency)) {
      this.setState({ errorMessage: 'gengissamanburður þessa gjaldmiðla er þegar virkur'});
    } else if(maximumExceeded) {
      this.setState({ errorMessage: 'Of margir gengissamanburðir virkir, vinsamlegast fjarlægðu einn eða fleiri til að bæta við nýjum gengissamanburð'});
    } else {
      this.setState({ errorMessage: ' ', isAdding: true});
      this.props.addGraph(sourceCurrency, destCurrency, ((success: boolean, status: number) => {
        if(!success) {
          this.setState({
            errorMessage: status === 404 ?
            status + ': Samanburðargengisþróun fyrir valda gjaldmiðla finnst ekki í gagnagrunni' :
            status + ': Eitthvað fór úrskeiðis við að sækja gögn úr gagnagrunni, vinsamlegast athugaðu tengingu',
            isAdding: false
          });
        } else {
          this.setState({ isAdding: false });
        }
      }));
    }
  }
  render(): JSX.Element {
    const { currencies } = this.props;
    return(
      <div>
      <div className='add-currency-options'>
        <select
          className='currency-select'
          id='target-currency'
          value={this.state.destCurrency}
          onChange={(e: any) => this.setState({destCurrency: e.target.value}) }
        >
          <option value={''}>Veldu mynt</option>
          { currencies.map((currency: any, i: any) =>
            <option key={i} value={currency.id}>{currency.id}: {currency.name}</option>
					)} 
        </select> 
        <p>|</p>
        <select
          className='currency-select'
          id='source-currency'
          value={this.state.sourceCurrency}
          onChange={(e: any) => this.setState({sourceCurrency: e.target.value}) }
        >
          { currencies.map((currency: any, i: any) =>
            <option key={i} value={currency.id}>{currency.id}: {currency.name}</option>
					)} 
        </select>
        {this.state.isAdding ? <div className="loader loader-small"></div> : <div className="small-gray-btn" onClick={() => this.addCurrency()}>+</div>}
      </div>
      <p style={{ height: '10px', fontSize: '12px', textAlign: 'center', color: 'red' }}>{this.state.errorMessage}</p>
      </div>
    );
  }
}