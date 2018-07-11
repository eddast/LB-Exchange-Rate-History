import * as React from 'react';

interface AddCurrencyProps {
  maximumExceeded: boolean;
  currencies: any;
  addGraph: any;
}
interface AddCurrencyState {
  sourceCurrency: any;
  destCurrency: any;
  errorMessage: any;
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
      errorMessage: ''
    });
  }
  addCurrency(): void {
    const { sourceCurrency, destCurrency } = this.state;
    const { maximumExceeded } = this.props;
    if (sourceCurrency === destCurrency ) {
      this.setState({ errorMessage: 'Vinsamlegast veldu mismunandi myntir í báða reiti'});
    } else if (destCurrency === '') {
      this.setState({ errorMessage: 'Vinsamlegast veldu mynt í báða reiti'});
    } else if(maximumExceeded) {
      this.setState({ errorMessage: 'Of margir gengissamanburðir virkir, vinsamlegast fjarlægðu einn eða fleiri'});
    }else {
      this.setState({ errorMessage: ' '});
      this.props.addGraph(sourceCurrency, destCurrency, ((status: any) => {
        this.setState({
          errorMessage: status === 404 ?
          status + ': Samanburðargengisþróun fyrir valda gjaldmiðla finnst ekki í gagnagrunni' :
          status + ': Eitthvað fór úrskeiðis við að sækja gögn úr gagnagrunni, vinsamlegast athugaðu tengingu'
        });
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
        <div className="small-gray-btn" onClick={() => this.addCurrency()}>+</div>
      </div>
      <p style={{ height: '10px', fontSize: '12px', textAlign: 'center', color: 'red' }}>{this.state.errorMessage}</p>
      </div>
    )
  }
}