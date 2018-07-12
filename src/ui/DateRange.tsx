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
    { name: 'Vika', from: this.getDateWeeksBefore(1) },
    { name: 'Tvær Vikur', from: this.getDateWeeksBefore(2) },
    { name: 'Mánuður', from: this.getDateMonthsBefore(1) },
    { name: 'Sex Mánuðir', from: this.getDateMonthsBefore(6) },
    { name: 'Ár', from: this.getDateMonthsBefore(12) },
    { name: 'Tvö ár', from: this.getDateMonthsBefore(2 * 12) },
    { name: 'Fimm ár', from: this.getDateMonthsBefore(5 * 12) },
  ]
  getToday(): Date { return new Date() }
  getDateMonthsBefore(months: number): Date {
    let date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date;
  }
  getDateWeeksBefore(week: number): Date {
    let date = new Date();
    date.setMonth(date.getDate() - 7);
    return date;
  }
  componentWillMount(): void {
    this.setState({
      activeRange: this.PredefinedRanges[3]
    });
  }

  renderBar(i: number, isActive: boolean) {
    if (i < this.PredefinedRanges.length - 1) {

    } else if (i === 0) {

    }
    return <div className={isActive ? 'slide-bar active' : 'slide-bar'}></div>
  }

  render(): JSX.Element {
    return (
      <div className='date-range-slider'>
        {this.PredefinedRanges.map((range: any, i: number) => {
          const isActive: boolean = this.state.activeRange === range
          return ([
            <span key={i}>
              <div className={isActive ? 'slide-indicator active' : 'slide-indicator'} />
              {this.renderBar(i, isActive)}
            </span>,
            <span key={'label' + i} className={isActive ? 'date-range-label active' : 'date-range-label'}>{range.name}</span>
          ]);
        })}
      </div>
    )
  }
}