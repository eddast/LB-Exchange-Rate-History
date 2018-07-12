import * as React from 'react';

/**
 * CURRENCYTABLE COMPONENT
 * recieves exchange rate data as props, sorts it, extracts most significant values
 * and displays them in a sortable table
 */
interface CurrencyTableProps {
  data: any;                /* data to display */
  deleteComparison: any;    /* delete option for single comparison (data entry) */
  colors: any;              /* color pallette */
}
interface CurrencyTableState {
  data: any;                /* sorted data */
  sortedColumn: any;        /* column table is/should be sorted by*/
  descendingSort: boolean;  /* true if sort should be descending */
}
interface TableColumnValues {
  title: string;            /* Column value title (ICELANDIC)*/
  dataTargetID: string;     /* data object's property name that column displays */
  sortable: boolean;        /* true if column is/should be sortable */
}
interface TableColumnData {
  index: number;            /* index of entry in actual/unsorted data */
  currencies: string;       /* currencies being compared */
  initialMid: number;       /* initial mid (miðgengi) for period */
  endMid: number;           /* mid (miðgengi) at end of period */
  lowestMid: number;        /* lowest mid (miðgengi) for period */
  highestMid: number;       /* highest mid (miðgengi) for period */
  changePercentage: number; /* change between intial and end mid */
  color: string;            /* color associated with data */
}
export default class CurrencyTable extends React.Component<CurrencyTableProps, CurrencyTableState> {

  /* table columns table displays and the data entry object's property name they display */
  private tableColumns: TableColumnValues[] = [
    { title: '',                    dataTargetID: 'color',            sortable: false },
    { title: 'Gjaldmiðlar',         dataTargetID: 'currencies',       sortable: false },
    { title: 'Upphaf',              dataTargetID: 'initialMid',       sortable: true },
    { title: 'Endir',               dataTargetID: 'endMid',           sortable: true },
    { title: 'Lægst',               dataTargetID: 'lowestMid',        sortable: true },
    { title: 'Hæst',                dataTargetID: 'highestMid',       sortable: true },
    { title: 'Heildarbreyting (%)', dataTargetID: 'changePercentage', sortable: true },
    { title: '',                    dataTargetID: 'deleteAction',     sortable: false },
  ];

  /* initialize state and data */
  componentWillMount(): void {
    this.setState({
      data: this.getDataValues(),
      descendingSort: false,
      sortedColumn: 'changePercentage'
    });
  }

  /* re-sort data when it updates */
  componentDidUpdate(prevProps: CurrencyTableProps) {
    if (this.props !== prevProps) {
      this.setState({ data: this.getDataValues(), descendingSort: !this.state.descendingSort }, () => {
        this.handleClick(this.state.sortedColumn)
      });
    }
  }

  /* parses data into usable table entries for table */
  getDataValues(): any {
    const { data } = this.props;
    let tableEntries: any[] = [];

    /* parse data - extract high, low, etc */
    data.forEach((pts: any, i: number) => {
      let currentHighestMid = pts[0].mid, currentLowestMid = pts[0].mid, currentSum = 0;
      pts.map((p: any) => {
        currentLowestMid > p.mid ? currentLowestMid = p.mid : null;
        currentHighestMid < p.mid ? currentHighestMid = p.mid : null;
        currentSum = currentSum + p.mid;
      });
      /* extract first and last values*/
      const initialMid: number = parseFloat(pts[0].mid.toFixed(4));
      const endMid: number = parseFloat(pts[pts.length - 1].mid.toFixed(4));
      
      /* setup single data entry and add it to table entries */
      const tableEntry: TableColumnData = {
        index: i,
        currencies: pts[0].quoteCurrency + '-' + pts[0].baseCurrency,
        initialMid: initialMid,
        endMid: endMid,
        lowestMid: parseFloat(currentLowestMid.toFixed(4)),
        highestMid: parseFloat(currentHighestMid.toFixed(4)),
        changePercentage: this.calculateChangePercentage(endMid, initialMid),
        color: this.props.colors[i % this.props.colors.length]
      }; tableEntries.push(tableEntry);
    });

    return tableEntries;
  }

  /* calculates change percentage (heildarbreytingu) */
  calculateChangePercentage(endValue: number, initialValue: number): number {
    return parseFloat((((endValue - initialValue) / endValue) * 100).toFixed(3))
  }

  /* sorts data ascending or descending when table head is clicked */
  handleClick(colDataTarget: any): void {
    const descendingSorted = this.state.sortedColumn === colDataTarget ? !this.state.descendingSort : false;
    this.setState({
      descendingSort: descendingSorted,
      sortedColumn: colDataTarget,
      data: this.sortDataByColumn(colDataTarget, descendingSorted)
    });
  }

  /* sorts numeric data by a column given it's dataTargetID (property name) to be sorted
   * sorts either ascending or descending */
  sortDataByColumn(dataTargetID: number, ascendingSort: boolean) {
    ascendingSort ?
      this.state.data.sort(comparatorFunc) :
      this.state.data.sort(comparatorFunc).reverse();
    function comparatorFunc(a: any, b: any) {
      const rhs = parseFloat(a[dataTargetID]), lhs = parseFloat(b[dataTargetID]);
      return rhs === lhs ? 0 : rhs < lhs ? -1 : 1;
    }
    return this.state.data;
  }

  /* display table with sorted data */
  render(): JSX.Element {
    return (
      <table className="currency-table">
        <thead>
          <tr>
            {this.tableColumns.map((column: any, i: number) => {
              const isActiveColumn: boolean = this.state.sortedColumn === column.dataTargetID;
              /* return column header without sorting options */
              if(!column.sortable) {
                return <th>{column.title}</th>

              /* otherwise return with sorting function and sort indicator on hover (small arrow) */
              } else {
                return (
                  <th
                    onClick={() => this.handleClick(column.dataTargetID)}
                  >
                    {column.title}
                    {isActiveColumn ?
                       <strong> {(this.state.descendingSort) ? ' ↓' : ' ↑'}</strong> :
                      <span className="indicate-sort"> ↑</span>}
                  </th>
                );
              }
            })}
          </tr>
        </thead>
        <tbody>
          {this.state.data.map((entry: any, i: number) => {
            return (
              <tr key={i}>
                {this.tableColumns.map((column: any, j: number) => {

                  /* special columns; displayed differently */
                  const isColor: boolean = column.dataTargetID === 'color';
                  const isChangeValue: boolean = column.dataTargetID === 'changePercentage';
                  const isDeleteAction: boolean = column.dataTargetID === 'deleteAction';

                  /* color column returns color indicator */
                  if(isColor) {
                    return <td><div className="graph-color graph-color-small" style={{ backgroundColor: entry.color }} /></td>;

                  /* change value has a color indicating if it's positive */
                  } else if(isChangeValue) {
                    return <td style={{ color: entry[column.dataTargetID] < 0 ? 'red' : 'green' }}>{entry[column.dataTargetID]}</td>;

                  /* delete column displays delete action if table has more than one value */
                  } else if (isDeleteAction) {
                    if(this.state.data.length > 1) {
                      return (
                      <td>
                        <div
                          className="small-gray-btn"
                          onClick={() => { this.props.deleteComparison(entry.index) }}
                        >
                        x
                        </div>
                      </td>
                      );
                    } else {
                      return <td/>
                    }

                  /* otherwise return data column*/
                  } else {
                    return <td>{entry[column.dataTargetID]}</td>
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    )
  }
}