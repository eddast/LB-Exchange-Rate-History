import * as React from 'react';

interface DateRangeProps {
  changeDateRange: any;
}
interface DateRangeState {
  activeRange: TimeRanges;
}
interface TimeRanges {
  name: string;
  from: Date;
}
export default class DateRange extends React.Component<DateRangeProps, DateRangeState> {
  private PredefinedRanges: TimeRanges[] = [
    { name: 'vika', from: this.getDateWeeksBefore(1) },
    { name: 'tvær vikur', from: this.getDateWeeksBefore(2) },
    { name: 'mánuður', from: this.getDateMonthsBefore(1) },
    { name: 'sex mánuðir', from: this.getDateMonthsBefore(6) },
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
  getDateWeeksBefore(week: number): Date {
    let date = new Date();
    date.setDate(date.getDate() - 7 * week);
    return date;
  }
  componentWillMount(): void {
    this.setState({
      activeRange: this.PredefinedRanges[3]
    });
  }

  renderBar(i: number, isActive: boolean, lessThanActive: boolean) {
    if (i >= this.PredefinedRanges.length - 1) {
      return <div className={isActive ? 'slide-bar active-bar' : 'slide-bar end'}></div>
    } else if (i === 0) {
      return <div className={lessThanActive ? 'slide-bar start active' : 'slide-bar start'}></div>
    } else if (isActive) {
      return [<div className={'slide-bar active-bar'}></div>, <div className={'slide-bar inactive-bar'}></div>]
    }
    return <div className={lessThanActive ? 'slide-bar active' : 'slide-bar'}></div>
  }

  render(): JSX.Element {
    return (
      <div className='date-range-container'>
        <div className='date-range-slider'>
          {this.PredefinedRanges.map((range: any, i: number) => {
            const isActive: boolean = this.state.activeRange === range;
            const lessThanActive: boolean = this.state.activeRange.from.getTime() < range.from.getTime();
            return ([
              <span
                key={i}
                onClick={() => {
                  this.setState({ activeRange: range });
                  this.props.changeDateRange(range.from, new Date());
                }}
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
                key={i + this.PredefinedRanges.length}
                onClick={() => {
                  this.setState({ activeRange: range });
                  this.props.changeDateRange(range.from, new Date());
                }}
                className={isActive ? 'date-range-label active' : 'date-range-label'}
              >
                {range.name}
              </span>
            ]);
          })}
        </div>
        <div className='date-range-picker-container'>
          <p>Gengisþróun tímabilsins</p>
          <input type="date" />
          <span>–</span>
          <input type="date" />
        </div>
      </div>
    )
  }
}