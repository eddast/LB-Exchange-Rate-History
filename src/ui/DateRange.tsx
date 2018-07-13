import * as React from 'react';

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
  private PredefinedRanges: TimeRanges[] = [
    { name: 'mánuður', from: this.getDateMonthsBefore(1) },
    { name: 'hálft ár', from: this.getDateMonthsBefore(6) },
    { name: 'ár', from: this.getDateMonthsBefore(12) },
    { name: 'tvö ár', from: this.getDateMonthsBefore(2 * 12) },
    { name: 'fimm ár', from: this.getDateMonthsBefore(5 * 12) },
  ]
  getToday(): Date { return new Date() }
  getDateMonthsBefore(months: number): Date {
    let date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
  }
  componentWillMount(): void {
    this.setState({
      toDateInput: this.props.toDate,
      fromDateInput: this.props.fromDate,
      activeRange: this.PredefinedRanges[~~(this.PredefinedRanges.length/2)],
      spin: false
    });
  }

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

  getInputDateStr(date: Date): string {
    const d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
          m = date.getMonth()+1 < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1), 
          y = date.getFullYear();
    return y+"-"+m+"-"+d;
  }

  isValidRange(from: Date, to: Date) {
    return from < to;
  }

  changeDate(activeRange: any, from: Date, to?: Date): void {
    if(this.props.canChangeDate) {
      if(to === undefined) {
        to = new Date();
      } else if (!this.isValidRange(from, to)){
        this.setState({ errorMessage: 'Ógilt tímabil valið'});
        return;
      } 
      this.setState({ activeRange: activeRange, errorMessage: '' });
      this.props.changeDateRange(from, to);
      this.spin();
    }
  }

  spin(): void {
    this.setState({ spin: true}, () =>
      setTimeout(() => { this.setState({spin: false}) }, 1000)
    );
  }

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
              style={{ backgroundColor: this.isValidRange(this.state.toDateInput, this.state.fromDateInput) ? 'gray' : ''}}
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