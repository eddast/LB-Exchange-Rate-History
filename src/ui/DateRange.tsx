import * as React from 'react';

/**
 * DATERANGE COMPONENT
 * Renders all options to manipulate period range of data and all logic
 */
interface DateRangeProps {
  changeDateRange: any;
  fromDate: Date;
  toDate: Date;
  canChangeDate: boolean;
}
interface DateRangeState {
  activeRange: any;
  fromDateInput: Date;
  toDateInput: Date;
  spin: Boolean;
  errorMessage: string;
}
interface TimeRanges {
  name: string;
  from: Date;
}
export default class DateRange extends React.Component<DateRangeProps, DateRangeState> {

  /* predefined period shortcuts for user, displayed as slider bar */
  private PredefinedRanges: TimeRanges[] = [
    { name: 'mánuður', from: this.getDateMonthsBefore(1) },
    { name: 'hálft ár', from: this.getDateMonthsBefore(6) },
    { name: 'ár', from: this.getDateMonthsBefore(12) },
    { name: 'tvö ár', from: this.getDateMonthsBefore(2 * 12) },
    { name: 'fimm ár', from: this.getDateMonthsBefore(5 * 12) },
  ]
  /* returns today's date */
  getToday(): Date { return new Date() }

  /* returns date a specific number of months ago */
  getDateMonthsBefore(months: number): Date {
    let date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
  }

  /* initialize state */
  componentWillMount(): void {
    this.setState({
      toDateInput: this.props.toDate,
      fromDateInput: this.props.fromDate,
      activeRange: this.PredefinedRanges[~~(this.PredefinedRanges.length/2)],
      spin: false
    });
  }

  /* Renders the shortcut periods slider bar as appropriate, indicating selected values */
  renderBar(i: number, isActive: boolean, lessThanActive: boolean) {
    if (i >= this.PredefinedRanges.length - 1) {
      return <div className={isActive ? 'slide-bar active-bar' : 'slide-bar end'}></div>
    } else if (i === 0) {
      return <div className={lessThanActive ? 'slide-bar start active' : 'slide-bar start'}></div>
    } else if (isActive) {
      return [<div key={'active-bar-'+i} className={'slide-bar active-bar'}></div>, <div key={'inactive-bar-'+i} className={'slide-bar inactive-bar'}></div>]
    }
    return <div className={lessThanActive ? 'slide-bar active' : 'slide-bar'}></div>
  }

  /* date picker sucks, so parse date to yyyy-mm-dd to use it */
  getInputDateStr(date: Date): string {
    const d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
          m = date.getMonth()+1 < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1), 
          y = date.getFullYear();
    return y+"-"+m+"-"+d;
  }

  /* returns true if user has chosen a valid time range */
  rangeChosen() {
    if(this.state.fromDateInput >= this.state.toDateInput) {
      return {
        valid: false,
        message: 'Upphafsdagsetning tímabils þarf að vera smærri en endadagsetning'
      }
    } else if (this.state.fromDateInput > new Date() || this.state.toDateInput > new Date()) {
      return {
        valid: false,
        message: 'Ekki má velja ókomna dagsetningu'
      }
    } else {
      return {
        valid: true,
        message: ''
      }
    }
  }

  /* changes period for exchange rate data */
  changeDate(activeRange: any, from: Date, to?: Date): void {
    if(this.props.canChangeDate) {
      if(to === undefined) {
        to = new Date();
      } else if (!this.rangeChosen().valid){
        this.setState({ errorMessage: this.rangeChosen().message });
        return;
      } 
      this.setState({ activeRange: activeRange, errorMessage: '' });
      this.props.changeDateRange(from, to);
      this.spin();
    }
  }

  /* spins refresh button once to indicate load */
  spin(): void {
    this.setState({ spin: true}, () =>
      setTimeout(() => { this.setState({spin: false}) }, 1000)
    );
  }
 
  /* renders option to manipulate time period range */
  render(): JSX.Element {
    return (
      <div className='date-range-container'>
        <div className='date-range-picker'>
          <div className='date-range-picker-container'>
            <span>Gengisþróun</span>
            <span>
              <input
                type="date"
                value={this.getInputDateStr(this.state.fromDateInput)}
                onChange={(e: any) => this.setState({ fromDateInput: new Date(e.target.value) }) }
              />
              <span style={{ marginLeft: '15px', marginRight: '15px' }}> til </span>
              <input
                type="date"
                value={this.getInputDateStr(this.state.toDateInput)}
                onChange={(e: any) => this.setState({ toDateInput: new Date(e.target.value) }) }
              />
            </span>
            <span
              className={this.state.spin ? 'single-spin btn' : 'btn'}
              style={{ backgroundColor: this.rangeChosen().valid ? '' : 'gray'}}
              onClick={() => this.changeDate(null, this.state.fromDateInput, this.state.toDateInput)}
            >
              <span/>
            </span>
          </div>
          <div>
            <p style={{ display: this.state.errorMessage !== '' ? 'block' : 'none', height: '10px', margin: '7px 0', fontSize: '10px', textAlign: 'center', color: 'red' }}>
              {this.state.errorMessage}
            </p>
          </div>
        </div>
        <div className='date-range-slider'>
          {this.PredefinedRanges.map((range: any, i: number) => {
            const isActive: boolean = this.state.activeRange === range;
            const lessThanActive: boolean = this.state.activeRange === null ? false : this.state.activeRange.from.getTime() < range.from.getTime();
            return ([
              <span
                key={'slide-indicator-'+i}
                onClick={() => this.changeDate(range, range.from)}
                
              >
                <div
                  className={
                    isActive ? 'slide-indicator active' :
                      lessThanActive ? 'slide-indicator less-than-active' :
                        'slide-indicator'
                  }
                />
                {this.renderBar(i, isActive, lessThanActive)}
              </span>,
              <span
                key={'label-' + i}
                onClick={() => {
                  
                }}
                className={isActive ? 'date-range-label active' : 'date-range-label'}
              >
                {range.name}
              </span>
            ]);
          })}
        </div>
      </div>
    )
  }
}