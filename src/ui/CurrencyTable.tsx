import * as React from 'react';

interface CurrencyTableProps {
  data: any;
  deleteComparison: any;
  colors: any;
}
interface CurrencyTableState {
  data: any;
  sortedColumn: any;
  toggle: boolean;
  rows: any;
}

export default class CurrencyTable extends React.Component <CurrencyTableProps, CurrencyTableState> {	
  // private dataTargetTitles: any = {
  //   initialMid: 'Upphaf',
  //   endMid: 'Endir',
  //   lowestMid: 'Lægst',
  //   highestMid: 'Hæst',
  //   changePercentage: 'Heildarbreyting (%)'
  // };
  componentWillMount(): void {
    this.setState({
      data: this.getDataValues(),
      toggle: false,
      sortedColumn: 'changePercentage'
    });
  }
  componentDidUpdate(prevProps: CurrencyTableProps) {
    if(this.props !== prevProps) {
      this.setState({ data: this.getDataValues(), toggle: !this.state.toggle}, () => {
        this.handleClick(this.state.sortedColumn)
      });
    }
  }
  getDataValues(): any {
    const { data } = this.props;
    let tableEntries: any[] = []
    data.forEach((pts: any, i: number) => {
			let currentHighestMid = pts[0].mid, currentLowestMid = pts[0].mid, currentSum = 0;
			pts.map((p: any) => {
				currentLowestMid > p.mid ? currentLowestMid = p.mid : null;
				currentHighestMid < p.mid ? currentHighestMid = p.mid : null;
				currentSum = currentSum + p.mid;
			});
			const tableEntry = {
        id: i,
        currencies: pts[0].quoteCurrency + '-' + pts[0].baseCurrency,
				initialMid: parseFloat(pts[0].mid),
				endMid: parseFloat(pts[pts.length-1].mid.toFixed(4)),
				lowestMid: parseFloat(currentLowestMid.toFixed(4)),
        highestMid: parseFloat(currentHighestMid.toFixed(4)),
        color: this.props.colors[i % this.props.colors.length],
        changePercentage: parseFloat((((pts[pts.length-1].mid - pts[0].mid)/pts[pts.length-1].mid)*100).toFixed(3))
			}
			tableEntries.push(tableEntry);
    }); 
    return tableEntries;
  }
  handleClick(colDataTarget: any): void {
    this.setState({
      toggle: this.state.sortedColumn === colDataTarget ? !this.state.toggle : false,
      sortedColumn: colDataTarget,
      rows: this.sortByColumn(this.state.data, colDataTarget)
    });
  }
  sortByColumn(a: any, colID: number) {
    this.state.toggle ?
      a.sort(comparatorFunc) :
      a.sort(comparatorFunc).reverse();
    function comparatorFunc(a: any, b: any) {
      const rhs = parseFloat(a[colID]), lhs = parseFloat(b[colID]);
      return rhs === lhs ? 0 : rhs < lhs ? -1 : 1;
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
              <th onClick={() => this.handleClick('initialMid')}>
               Upphaf
               {(this.state.sortedColumn === 'initialMid') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>

              <th onClick={() => this.handleClick('endMid')}>
               Endir
               {(this.state.sortedColumn === 'endMid') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>
              <th onClick={() => this.handleClick('lowestMid')}>
               Lægst
               {(this.state.sortedColumn === 'lowestMid') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>
              <th onClick={() => this.handleClick('highestMid')}>
               Hæst
               {(this.state.sortedColumn === 'highestMid') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>
              <th onClick={() => this.handleClick('changePercentage')}>
               Heildarbreyting (%)
               {(this.state.sortedColumn === 'changePercentage') ? (this.state.toggle) ? " ↓": " ↑" : <span className="indicate-sort"> ↑</span>}
              </th>
              <th/>
          </tr>
        </thead>
        <tbody>
          {this.state.data.map((entry: any, i: number) => {
            return (
              <tr key={i}>
                <td><div className="graph-color graph-color-small" style={{ backgroundColor: entry.color }}/></td>
                <td><strong>{entry.currencies}</strong></td>
                <td>{entry.initialMid}</td>
                <td>{entry.endMid}</td>
                <td>{entry.lowestMid}</td>
                <td>{entry.highestMid}</td>
                <td style={{ color: entry.changePercentage < 0 ? 'red' : 'green' }}>{entry.changePercentage}</td>
                {this.state.data.length > 1 ?
                <td>
                  <div
                    className="small-gray-btn"
                    onClick={() => { this.props.deleteComparison(i)}}
                  >
                    x
                  </div>
              </td>: null}
              </tr>
            );
          })}
        </tbody>
      </table>
    )
  }
}