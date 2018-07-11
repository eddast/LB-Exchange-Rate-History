import * as React from 'react';
let colors = [ '#194262', '#E91E63', '#4CAF50', '#009688', '#FF5722', '#607D8B', '#263238', '#F44336', '#2196F3', '#90A4AE', '#673AB7', '#3F51B5', '#FF5722', '#FF5722', '#9C27B0', '#FFEB3B', '#CDDC39', '#8BC34A'];

interface CurrencyTableProps {
  data: any;
}
interface CurrencyTableState {
  data: any;
  activeColumn: any;
  lastActiveColumn: any;
  toggle: boolean;
  rows: any;
}

export default class CurrencyTable extends React.Component <CurrencyTableProps, CurrencyTableState> {	
  componentWillMount(): void {
    this.setState({
      data: this.getDataValues(),
      toggle: false,
      activeColumn: '',
      lastActiveColumn: 0,
    });
  }
  componentDidUpdate(prevProps: CurrencyTableProps) {
    if(this.props !== prevProps) {
      this.setState({ data: this.getDataValues()});
    }
  }
  getDataValues(): any {
    const { data } = this.props;
    let tableEntries: any[] = []
    data.forEach((pts: any, i: number) => {
			let currentHighestMid = pts[0].mid, currentLowestMid = pts[0].mid, currentSum = 0;
			pts.map((p: any) => {
				// Extract values for single dataset to construct table
				currentLowestMid > p.mid ? currentLowestMid = p.mid : null;
				currentHighestMid < p.mid ? currentHighestMid = p.mid : null;
				currentSum = currentSum + p.mid;
			});
			const tableEntry = {
        currencies: pts[0].baseCurrency + '-' + pts[0].quoteCurrency,
				initialMid: parseFloat(pts[0].mid),
				endMid: parseFloat(pts[pts.length-1].mid.toFixed(4)),
				lowestMid: parseFloat(currentLowestMid.toFixed(4)),
        highestMid: parseFloat(currentHighestMid.toFixed(4)),
        color: colors[i % colors.length]
			}
			tableEntries.push(tableEntry);
    }); 
    return tableEntries;
  }
  handleClick(title: any): void {
    if (this.state.activeColumn === title) {
      let toggle = !this.state.toggle
      this.setState({
        toggle: toggle,
        activeColumn: title,
        rows: this.sortByColumn(this.state.data, title, toggle)
      })
    } else {
      this.setState({
        activeColumn: title,
        rows: this.sortByColumn(this.state.data, title, false)
      })
    }
  }
  sortByColumn(a: any, colIndex: number, reverse: any) {
    if (reverse == true) {
      a.sort(sortFunction).reverse();
    } else {
      a.sort(sortFunction);
    }
  
    function sortFunction(a: any, b: any) {
      if (a[colIndex] === b[colIndex]) {
        return 0;
      } else {
        return (a[colIndex] < b[colIndex]) ? -1 : 1;
      }
    }
    return a;
  }
  render(): JSX.Element {
    return (
      <table className="currency-table">
        <thead>
          <tr>
              <th/>
            	<th>Gjaldmiðlar</th>
              <th onClick={() => this.handleClick('Upphaf')}>
               Upphaf
               {(this.state.activeColumn === 'Upphaf') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>
              <th onClick={() => this.handleClick('Endir')}>
               Endir
               {(this.state.activeColumn === 'Endir') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>
              <th onClick={() => this.handleClick('Lægst')}>
               Lægst
               {(this.state.activeColumn === 'Lægst') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>
              <th onClick={() => this.handleClick('Hæst')}>
               Hæst
               {(this.state.activeColumn === 'Hæst') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>
              <th onClick={() => this.handleClick('Heildarbreyting')}>
               Heildarbreyting
               {(this.state.activeColumn === 'Heildarbreyting') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>
          </tr>
        </thead>
        <tbody>
          {this.state.data.map(function(entry: any, i: number) {
            const changePercentage: number = (((entry.endMid - entry.initialMid)/entry.endMid)*100);
            return (
              <tr key={i}>
                <td><div className="graph-chip-color" style={{ backgroundColor: entry.color }}/></td>
                <td><strong>{entry.currencies}</strong></td>
                <td>{entry.initialMid}</td>
                <td>{entry.endMid}</td>
                <td>{entry.lowestMid}</td>
                <td>{entry.highestMid}</td>
                <td style={{ color: changePercentage < 0 ? 'red' : 'green' }}>{parseFloat(changePercentage.toFixed(3))}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )
  }
}