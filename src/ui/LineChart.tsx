import * as React from 'react';
import GraphChip from './GraphChip';

/**
 * CONSTANTS
 * (Colors picked from open source MaterialUI pallette: https://material-ui.com/style/color/)
 * */
const monthID = [ 'jan', 'feb', 'mars', 'apr', 'maí', 'jún', 'júl', 'ág', 'sept', 'okt', 'nóv', 'des' ];
const months = [ 'janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember' ];
let colors = [ '#194262', '#E91E63', '#4CAF50', '#009688', '#FF5722', '#607D8B', '#263238', '#F44336', '#2196F3', '#90A4AE', '#673AB7', '#3F51B5', '#FF5722', '#FF5722', '#9C27B0', '#FFEB3B', '#CDDC39', '#8BC34A'];
const transparent = '#FFFFFF00';
const lightGray = '#EAEAEA';


/**
 * LINECHART COMPONENT
 * Plots a SVG line chart from exchange rate data provided as props
 */
interface LineChartProps {
  data: any;							/* Data to plot in chart */
	deleteGraph: any;				/* function; executed when user deletes sub graph from chart */
}
interface LineChartState {
  tooltip: boolean;				/* True if tooltip is to be displayed for point */
  tooltipPoint: any;			/* The point values to show tooltip for */
  updating: boolean;			/* True if chart is updating */
}
export default class LineChart extends React.Component <LineChartProps, LineChartState> {

	/* Initialize state */
  componentWillMount(): void {
		const tooltipValues = { value: '', x: 0, y: 0, color: '' }
    this.setState({
			tooltip: false,
			tooltipPoint: tooltipValues,
			updating: false,
		});
  }
	
	/* Detect chart update, enabling fade in animation for .3 secs */
	componentWillReceiveProps(): void {		
		this.setState({ updating: true }, () => setTimeout(() =>
    this.setState({ updating: false }), 300))		
	}
	
	/* Show tooltip for point */
	showTooltip = (point: any): void => {
		this.setState({
			updating: false,
			tooltip: true,
			tooltipPoint: point,
		});
	}

	pushBackColor(color: string, colorIdx: number): void {
		colors.splice(colorIdx, 1);
		colors.push(color);
	}
	
	/* Plot chart */
	render(): JSX.Element {

		/* Configure chart appearance */
		const { data } = this.props;
		const width = 650;
		const height = width * .4;
		const size = data.length === 0 ? 1 : data[0].length - 1;
		const padding = 50;
	
    /* Calculate highest point to set proper height and width ratio */
		let dataSet: any = [], minValue = Number.MAX_VALUE, maxValue = 0, heightRatio = 1;
		let firstDataset = data[0], minDate = new Date(firstDataset[0].date), maxDate = new Date(firstDataset[0].date);
    dataSet = data.forEach((pts: any, i: number) => {
			pts.map((p: any) => {
				// Extract values for all datasets to construct graphs
				p.mid > maxValue ? maxValue = p.mid : null;
				p.mid < minValue ? minValue = p.mid : null;
				const currDate = new Date(p.date);
				currDate.getTime() > maxDate.getTime() ? maxDate = currDate : null;
				currDate.getTime() < minDate.getTime() ? minDate = currDate : null;
			});
		}); heightRatio = maxValue === 0 ? 1 : height / (maxValue - minValue);

		/* Setup data, calculate x and y coordinates and set color */
		dataSet = data.map((pts: any, datasetIndex: any) =>
			pts.map((pt: any, pi: any) => ({
				x: ~~((width / size) * pi + padding) + .5,										/* x coordinate of point in graph */
				y: ~~((heightRatio) * (maxValue - pt.mid) + padding) + .5,		/* y coordinate of point in graph */
				value: pt,																										/* value point holds */
				color: colors[datasetIndex % colors.length]										/* color assigned to point (and dataset) */
			})		
		));
		
	/**
	 * PLOT LINECHART
	 * Plot axis from data's maximum values
	 * For each data set, plot it's points and lines between it on graph
	 */
	return (
		<span>
			<span className="graph-chips">
				{ dataSet.map((comparisonGraph: any, graphIdx: any) =>
					<GraphChip
						key={graphIdx}
						title={comparisonGraph[0].value.baseCurrency + '-' + comparisonGraph[0].value.quoteCurrency}
						color={ colors[graphIdx % colors.length] }
						last={dataSet.length===1}
						onDelete={() => {
							this.pushBackColor( colors[graphIdx % colors.length], (graphIdx % colors.length));
							this.props.deleteGraph(graphIdx);
						}}
					/>
				)}
			</span>
				<span className="rate-history-chart" style={{ width: width + 2*padding }}>
					<svg
						width={(width + padding * 2)+'px'}
						height={(height + 2*padding)+'px'}
					>
						<g>
							<XAxis
								minDate={minDate}
								maxDate={maxDate}
								padding={padding}
								width={width}
								height={height}
							/>
							<YAxis
								maxValue={maxValue}
								minValue={minValue}
								padding={padding}
								width={width}
								height={height}
							/>
						</g>
						{ dataSet.map((comparisonGraph: any, graphIdx: any) =>
							<g key={ graphIdx }>
								<Lines
									points={ comparisonGraph }
									dataSetIndex={ graphIdx }
									width={ width }
									height={ height }
									padding={ padding }
									color={ colors[graphIdx % colors.length] }
									updating={ this.state.updating }
								/>
								<Points
									points={ comparisonGraph }
									dataSetIndex={ graphIdx }
									showTooltip={ this.showTooltip }
									hideTooltip={ () => this.setState({ tooltip: false }) }
								/>
							</g>
						)}
					</svg>
					{ this.state.tooltip ?
						<Tooltip
							point={this.state.tooltipPoint}
						/>
					: null }
				</span>
			</span>
		);
	}
};


/**
 * TOOLTIP COMPONENT
 * Displays a tooltip at a set coordinate
 */
interface TooltipProps {
  point: any;				/* point value tooltip displays, it's coordinates and color */
}
const Tooltip = ({ point }: TooltipProps) => {
	const { value } = point;
	const date = new Date(value.date)
  return (
		<span
			className="rate-history-chart--tooltip"
			style={{ textAlign: 'center', color: point.color, left: ~~point.x, top: ~~point.y+20 }}
		>
			<p><strong>{value.baseCurrency}-{value.quoteCurrency}</strong></p>
			<p>{date.getDate()}. {months[date.getMonth()]} {date.getFullYear()}</p>
			<p>Miðgengi: <strong>{value.mid}</strong></p>
    </span>
  );
};

/**
 * YAXIS COMPONENT
 * Plots Y Axis for line chart
 */
interface YAxisProps {
  padding: number;							/* padding of linechart in px */
  height: number;								/* linechart height in px */
	maxValue: number;							/* highest y value of linechart */
	minValue: number;							/* lowest y value of linechart */
	width: number;								/* linechart width in px */
}
const YAxis = ({ padding, height, maxValue, minValue, width }: YAxisProps) => {
	const numAxis = 6;											/* number of axis */
	let axis = [];

	/* get interval values */
	const intervalStep = (maxValue - minValue) / numAxis;
	let intervals = [], currVal = maxValue;
	intervals.push(maxValue);
	for (let i = 1; i < numAxis; i++) {
		currVal -= intervalStep;
		intervals.push(currVal);
	} intervals.push(minValue); 
	
	/* set up all axis */
	for (let i = 0; i < numAxis; i++) {
		const y = ~~(i * (height / (numAxis-1)) + padding) + .5
		axis.push(
			<g key={i}>
				<line
					x1={ padding }
					y1={ y }
					x2={ width + padding }
					y2={ y }
					stroke={lightGray}
					strokeWidth='1px'
				/>
				<text
					className="rate-history-chart--axis"
					x={ padding - 10 }
					y={ y + 2 }
					textAnchor="end"
				>
					{/* {~~(maxValue / (numAxis-1)) * ((numAxis-1) - i)} */}
					{intervals[i].toFixed(2)}
				</text>
			</g>
		);
	}
	
	return <g>{axis}</g>;
}

/**
 * XAXIS COMPONENT
 * Plots X Axis for line chart
 */
interface XAxisProps {
  padding: number;							/* padding of linechart in px */
  height: number;								/* linechart height in px */
	minDate: Date;								/* min x value in for data */
	maxDate: Date;								/* max x value in array */
	width: number;								/* linechart width data px */
}
const XAxis = ({ padding, height, minDate, maxDate, width }: XAxisProps) => {
	let yaxis = [];										
	const numAxis = 8;						/* number of axis */
	height = height + padding;		/* height for chart */

	/* set up axis */
  const intervalStep = (maxDate.getTime() - minDate.getTime()) / (numAxis-1);
  const intervals = [];
  intervals.push(minDate);
	for (let i = 1; i < numAxis-1; i++) {
		const day = new Date(minDate);
		day.setMilliseconds(i * intervalStep);
		intervals.push(day);
	}
	intervals.push(maxDate);

	/* set up all axis */
	for (let i = 0; i < numAxis; i++) {
		let x = ~~(i * (width / (numAxis-1)) + padding) + .5
		yaxis.push(
			<g key={i}>
				<text
					className="rate-history-chart--axis"
					x={x}
					y={height + 25}
					textAnchor="middle"
				>
					{intervals[i].getDate() + '. ' + monthID[intervals[i].getMonth()]}
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

	return <g>{yaxis}</g>
};


/**
 * POINTS COMPONENT
 * Plots all points for a all graph datasets in graph
 */
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
						showTooltip={showTooltip}
						hideTooltip={hideTooltip}
					/>)}
			</g>
		);
};

/**
 * LINES COMPONENT
 * Plots lines between correct points in graph
 */
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
		let path: any = [],	style = {}; height += padding;

		/* hide lines if graph is being updated */
		if (updating === true) {
			style['opacity'] = 0
			style['transition'] = 'none'
		}

		/* draw a line between subsequent points */
		path = points.map((point: any, idx: any) => (
			idx === 0  ? '' : (idx === 1 ? 'L' : '')) + point.x + ',' + point.y
		); path = 'M' + path.join(' ');

		return <g><path d={ path } fill="none" stroke={ color } /></g>;
};

/**
 * POINT COMPONENT
 * Plots a single point in graph
 * Implements its hover logic
 */
interface PointProps {
	point: any;						/* coordinates, value and color of point */
	showTooltip: any;			/* function, shows tooltip for point */
	hideTooltip: any;			/* function, hides tooltip for point */
}
interface PointState {
	show: boolean;				/* true if specific graph point should be shown */
}
class Point extends React.Component <PointProps, PointState> {

	/* Initialize state */
  componentWillMount(): void {
    this.setState({ show: false });
	}

	/* Shows point and tooltip when point is hovered*/
	showInfo(): void {
    this.setState({ show: true });
		this.props.showTooltip(this.props.point);
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
        stroke={transparent}
        onMouseEnter={() => this.showInfo()}
        onMouseLeave={() => this.hideInfo()}
      />
    );
	}
};