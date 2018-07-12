import * as React from 'react';

interface DateRangeProps {
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
    if (i < this.PredefinedRanges.length - 1) {

    } else if (i === 0) {

    } else if (isActive) {
      console.log('active')
      return [<div className={'slide-bar active-bar'}></div>, <div className={'slide-bar inactive-bar'}></div>]
    }
    return <div className={lessThanActive ? 'slide-bar active' : 'slide-bar'}></div>
  }

  render(): JSX.Element {
    return (
      <div className='date-range-slider'>
        {this.PredefinedRanges.map((range: any, i: number) => {
          const isActive: boolean = this.state.activeRange === range;
          const lessThanActive: boolean = this.state.activeRange.from.getTime() < range.from.getTime();
          return ([
            <span onClick={() => this.setState({ activeRange: range })}>
              <div className={
                isActive ? 'slide-indicator active' :
                  lessThanActive ? 'slide-indicator less-than-active' :
                    'slide-indicator'}
              />
              {this.renderBar(i, isActive, lessThanActive)}
            </span>,
            <span
              onClick={() => this.setState({ activeRange: range })}
              className={isActive ? 'date-range-label active' : 'date-range-label'}
            >
              {range.name}
            </span>
          ]);
        })}
      </div>
    )
  }
}