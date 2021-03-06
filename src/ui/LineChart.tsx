import * as React from 'react';
import { MONTHS, MONTHIDS } from '../resources/constants';
import { ExchangeRateComparisonData } from '../resources/interfaces';
import CalculateChangePercentage from '../services/CalculateChangePercentage';

/**
 * TAKK ECHART COMPONENT
 * Plots a SVG line chart from exchange rate data provided as props
 */
interface LineChartProps {
  data: ExchangeRateComparisonData[]; /* Data to plot in chart */
  deleteGraph: any;				            /* function; executed when user deletes sub graph from chart */
  colors: string[];                   /* the color pallette which chips and graph use to identify graph*/
}
interface LineChartState {
  tooltip: boolean;				            /* True if tooltip is to be displayed for point */
  tooltipPoint: any;			            /* The point values to show tooltip for */
  tooltipPointInitial: any;			      /* The initial point of dataset for point to show tooltip for */
  updating: boolean;			            /* True if chart is updating */
}
export default class LineChart extends React.Component<LineChartProps, LineChartState> {

  /* Initialize state */
  componentWillMount(): void {
    const tooltipValues = { value: '', x: 0, y: 0, color: '' }
    this.setState({
      tooltip: false,
      tooltipPoint: tooltipValues,
      tooltipPointInitial: tooltipValues,
      updating: false,
    });
  }

  /* Detect chart update, enabling fade in animation for .3 secs */
  componentWillReceiveProps(): void {
    this.setState({ updating: true }, () => setTimeout(() =>
      this.setState({ updating: false }), 300))
  }

  /* Show tooltip for point */
  showTooltip = (point: any, initialPoint: any): void => {
    this.setState({
      updating: false,
      tooltip: true,
      tooltipPoint: point,
      tooltipPointInitial: initialPoint,
    });
  }

  /* gets milliseconds between two dates */
  getDateDifference(first: string, second: string) {
    return new Date(first).getTime() - new Date(second).getTime();
  }

  /* converts milliseconds to days */
  calculateDaysFromMilliseconds(pts: any): number {
    const ms = this.getDateDifference(pts[pts.length - 1].date, pts[0].date);
    return ms / 86400000;
  }

  /* returns true if time is longer than one day */
  longerThanDay(time: number): boolean { return time > 86400000; }

  /* Plot chart */
  render(): JSX.Element {

    /* Configure chart appearance */
    const { data } = this.props;
    const singleGraph = data.length <= 1;
    const width = 650;
    const height = width * .4;
    // const size = data.length === 0 ? 1 : data[0].length - 1;
    const padding = 50;

    /* Calculate highest point to set proper height and width ratio */
    const firstDataset = data[0];
    let dataSet: any = [], minValue = singleGraph ? firstDataset[0].mid : 0, maxValue = 0, heightRatio = 1;
    let minDate = new Date(firstDataset[0].date), maxDate = new Date(firstDataset[0].date);
    dataSet = data.forEach((pts: any, i: number) => {
      pts.map((p: any) => {
        // Extract values for all datasets to construct graphs
        const pointVal = singleGraph ? p.mid : CalculateChangePercentage(p.mid, pts[0].mid, 3);
        pointVal > maxValue ? maxValue = pointVal : null;
        pointVal < minValue ? minValue = pointVal : null;
        const currDate = new Date(p.date);
        currDate.getTime() > maxDate.getTime() ? maxDate = currDate : null;
        currDate.getTime() < minDate.getTime() ? minDate = currDate : null;
      });
    }); heightRatio = maxValue === 0 ? 1 : height / (maxValue - minValue);

    /* Setup data, calculate x and y coordinates and set color */
    dataSet = data.map((pts: any, datasetIndex: any) => {
      const days = this.calculateDaysFromMilliseconds(pts), xInterval = (width / (days - 1));
      let prevDate = pts[0].date, prevX = 0;
      return pts.map((pt: any, pi: any) => {
        let x = prevX === 0 ? padding + .5 : ~~(prevX + xInterval);
        if (this.longerThanDay(this.getDateDifference(pt.date, prevDate))) {
          x = ~~(prevX + (xInterval * 3)) + .5;
        } prevX = x; prevDate = pt.date;
        const pointVal = singleGraph ? pt.mid : CalculateChangePercentage(pt.mid, pts[0].mid, 3);
        return ({
          /* x coordinate of point in graph */
          x,
          /* y coordinate of point in graph */
          y: ~~((heightRatio) * (maxValue - pointVal) + padding) + .5,
          /* value point holds */
          value: pt,
          /* initial point in graph */
          initialValue: pts[0],
          /* color assigned to point (and dataset) */
          color: this.props.colors[datasetIndex % this.props.colors.length]
        })
      }
      )
    });

    /* find first Y to plot Y comparison line */
    let firstY = dataSet[0]; firstY = firstY[0].y;

    /* Plot linechart */
    return (
      <span className="rate-history-chart" style={{ width: width + 2 * padding }}>
        <svg
          width={(width + padding * 2) + 'px'}
          height={(height + 2 * padding) + 'px'}
          className="rate-history-chart-svg"
        >
          <g>
            <XAxis
              minDate={minDate}
              maxDate={maxDate}
              padding={padding}
              width={width}
              height={height}
              singleGraph={singleGraph}
            />
            <YAxis
              maxValue={maxValue}
              minValue={minValue}
              padding={padding}
              width={width}
              height={height}
              firstY={firstY}
              singleGraph={singleGraph}
            />
          </g>
          {dataSet.map((comparisonGraph: any, graphIdx: any) =>
            <g key={graphIdx}>
              <Lines
                points={comparisonGraph}
                dataSetIndex={graphIdx}
                width={width}
                height={height}
                padding={padding}
                color={this.props.colors[graphIdx % this.props.colors.length]}
                updating={this.state.updating}
              />
              <Points
                points={comparisonGraph}
                dataSetIndex={graphIdx}
                showTooltip={this.showTooltip}
                hideTooltip={() => this.setState({ tooltip: false })}
              />
            </g>
          )}
        </svg>
        {
          this.state.tooltip ?
            <Tooltip
              point={this.state.tooltipPoint}
              pointInitial={this.state.tooltipPointInitial}
            />
            : null
        }
      </span >
    );
  }
};


/* TOOLTIP FUNCTION: Displays a tooltip at a set coordinate */
interface TooltipProps {
  point: any;				  /* point tooltip displays */
  pointInitial: any;	/* initial point of dataset containing point tooltip displays */
}
const Tooltip = ({ point, pointInitial }: TooltipProps) => {
  const { value } = point;
  const date = new Date(value.date);
  const changeValuePercentage = CalculateChangePercentage(value.mid, pointInitial.value.mid, 2);
  return (
    <span
      className="rate-history-chart--tooltip"
      style={{ textAlign: 'center', color: point.color, left: ~~point.x, top: ~~point.y - 10 }}
    >
      <p><strong style={{ fontSize: '11px' }}>{value.quoteCurrency} - {value.baseCurrency}</strong></p>
      <div className="seperator-line" style={{ backgroundColor: point.color }} />
      <p>{date.getDate()}. {MONTHS[date.getMonth()]} {date.getFullYear()}</p>
      <p>Miðgengi: {value.mid}</p>
      <p>Breyting: &nbsp;
        <span
          style={{ color: changeValuePercentage >= 0 ? 'green' : 'red' }}
        >
          {changeValuePercentage}%
        </span>
      </p>
    </span>
  );
};

/* YAXIS FUNCTION: plots y-axis for line chart */
interface YAxisProps {
  padding: number;							/* padding of linechart in px */
  height: number;								/* linechart height in px */
  maxValue: number;							/* highest y value of linechart */
  minValue: number;							/* lowest y value of linechart */
  width: number;								/* linechart width in px */
  firstY: number;								/* y coordinate of first point */
  singleGraph: boolean;         /* true if only one graph is displayed */
}
const YAxis = ({ padding, height, maxValue, minValue, width, firstY, singleGraph}: YAxisProps) => {
  const numAxis = 6;											/* number of axis */
  let axis = [];

  /* get interval values */
  const intervalStep = (maxValue - minValue) / (numAxis - 1);
  let intervals = [], currVal = maxValue;
  intervals.push(maxValue);
  for (let i = 1; i < numAxis - 1; i++) {
    currVal -= intervalStep;
    intervals.push(currVal);
  } intervals.push(minValue);
  axis.push(
    <g key={numAxis + 1}>
      <line
        x1={padding}
        y1={firstY}
        x2={width + padding}
        y2={firstY}
        stroke={'#d3cccc'}
        strokeDasharray={"10,10"}
        strokeWidth='1px'
      />
    </g>
  );
  const x = ((width / 2) + padding) + .5;
  const y = ~~(height + (padding * 2.2)) + .5;
  axis.push(
    <g key={numAxis + 2}>
      <text
        className="rate-history-chart--label"
        x={x}
        y={y+15}
      >
        Dagsetning
      </text>
    </g>
  );

  /* set up all axis */
  for (let i = 0; i < numAxis; i++) {
    const y = ~~(i * (height / (numAxis - 1)) + padding) + .5
    axis.push(
      <g key={i}>
        <line
          x1={padding}
          y1={y}
          x2={width + padding}
          y2={y}
          stroke={'#ece8e8'}
          strokeWidth={'1px'}
        />
        <text
          className="rate-history-chart--axis"
          x={padding - 10}
          y={y + 2}
          textAnchor="end"
        >
          {parseFloat(intervals[i].toFixed(2)) + (singleGraph ? '' : '%')}
        </text>
      </g>
    );
  }
  return <g>{axis}</g>;
}

/* XAXIS FUNCTION: plots x-axis for line chart */
interface XAxisProps {
  padding: number;							/* padding of linechart in px */
  height: number;								/* linechart height in px */
  minDate: Date;								/* min x value in for data */
  maxDate: Date;								/* max x value in array */
  width: number;								/* linechart width data px */
  singleGraph: boolean;         /* true if only one graph is displayed */
}
const XAxis = ({ padding, height, minDate, maxDate, width, singleGraph }: XAxisProps) => {
  let axis = [];
  const numAxis = 8;						/* number of axis */
  height = height + padding;		/* height for chart */

  /* set up axis */
  const intervalStep = (maxDate.getTime() - minDate.getTime()) / (numAxis - 1);
  const intervals = [];
  intervals.push(minDate);
  for (let i = 1; i < numAxis - 1; i++) {
    const day = new Date(minDate);
    day.setMilliseconds(i * intervalStep);
    intervals.push(day);
  }
  intervals.push(maxDate);

  const x = -((height / 2) + padding) + .5;
  const y = 0;
  axis.push(
    <g key={numAxis + 2}>
      <text
        className="rate-history-chart--label-transpose"
        x={x}
        y={y - 20}
      >
        {singleGraph ? 'Miðgengi' : 'Breyting'}
      </text>
    </g>
  );
  /* set up all axis */
  for (let i = 0; i < numAxis; i++) {
    let x = ~~(i * (width / (numAxis - 1)) + padding) + .5
    axis.push(
      <g key={i}>
        <text
          className="rate-history-chart--axis"
          x={x}
          y={height + 25}
          textAnchor="middle"
        >
          {intervals[i].getDate() + '. ' + MONTHIDS[intervals[i].getMonth()]}
        </text>
        <text
          className="rate-history-chart--axis"
          x={x}
          y={height + 40}
          textAnchor="middle"
        >
          {intervals[i].getFullYear()}
        </text>

      </g>
    );
  }
  return <g>{axis}</g>
};


/* POINTS FUNCTION: plots all points for a all graph datasets in graph */
interface PointsProps {
  points: any;							/* all points of dataset */
  dataSetIndex: number;			/* index of current dataset in graph */
  showTooltip: any;					/* function, shows tooltip for a given point */
  hideTooltip: any;					/* function, hides tooltip for a given point */
}
const Points = ({ points, dataSetIndex, showTooltip, hideTooltip }: PointsProps) => {
  return (
    <g>
      {points.map((point: any, ptindex: any) =>
        <Point
          key={ptindex}
          point={point}
          initialPoint={points[0]}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
        />)
        }
    </g>
  );
};

/* LINES FUNCTION: plots lines between correct points in graph */
interface LinesProps {
  points: any;									/* points in graph */
  dataSetIndex: number;					/* index number for dataset*/
  width: number;								/* line chart width */
  height: number;								/* line chart height */
  padding: number;							/* line chart padding */
  color: string;								/* color of current dataset*/
  updating: boolean;						/* true if chart is updating */
}
const Lines = ({ points, dataSetIndex, width, height, padding, color, updating }: LinesProps) => {
  let path: any = [], style = {}; height += padding;

  /* hide lines if graph is being updated */
  if (updating === true) {
    style['opacity'] = 0
    style['transition'] = 'none'
  }

  /* draw a line between subsequent points */
  path = points.map((point: any, idx: any) => (
    idx === 0 ? '' : (idx === 1 ? 'L' : '')) + point.x + ',' + point.y
  ); path = 'M' + path.join(' ');

  return <g><path d={path} fill="none" stroke={color} /></g>;
};

/**
 * POINT COMPONENT
 * Plots a single point in graph
 * Implements its hover logic
 */
interface PointProps {
  point: any;						/* coordinates, value and color of point */
  initialPoint: any;		/* coordinates, value and color of initial point in set */
  showTooltip: any;			/* function, shows tooltip for point */
  hideTooltip: any;			/* function, hides tooltip for point */
}
interface PointState {
  show: boolean;				/* true if specific graph point should be shown */
}
class Point extends React.Component<PointProps, PointState> {

  /* Initialize state */
  componentWillMount(): void {
    this.setState({ show: false });
  }

  /* Shows point and tooltip when point is hovered*/
  showInfo(): void {
    this.setState({ show: true });
    this.props.showTooltip(this.props.point, this.props.initialPoint);
  }

  /* Hides point and tooltip when point is hovered*/
  hideInfo(): void {
    this.setState({ show: false });
    this.props.hideTooltip();
  }

  /* show a specific point */
  render(): JSX.Element {
    const { point } = this.props;
    return (
      <circle
        className="chart-point"
        r={5}
        cx={point.x}
        cy={point.y}
        fill={this.state.show ? point.color : 'none'}
        stroke={'#FFFFFF00'}
        strokeWidth={"25px"}
        onMouseEnter={() => this.showInfo()}
        onMouseLeave={() => this.hideInfo()}
      />
    );
  }
};