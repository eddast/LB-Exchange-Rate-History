import * as React from 'react';

/**
 * GRAPHCHIP COMPONENT
 * Deletes chosen exhange history entry from chart and shows color
 */
interface GraphChipState {
  shrink: boolean;        /* true if chip should shrink */
  timeout: any;           /* storing potential timeout to clear it on unmount */
}
interface GraphChipProps {
  title: string;				   /* chip title */
  color: string;				   /* chip color */
  onDelete: any;				   /* function, action when chip is deleted */
  last: boolean;           /* true if chip is last of his kind */
}
class GraphChip extends React.Component <GraphChipProps, GraphChipState> {

  private timeout: any = null; /* always store timeout to clear it on unmount */

  /* initialize state */
  componentWillMount(): void {
    this.setState({ shrink: false });
  }

  /* always clear potential timeout on unmount */
  componentWillUnmount(): void {
    clearTimeout(this.timeout);
  }

  /* display a single chip that can delete data from graph */
  render(): JSX.Element {
    const { title, color, onDelete, last } = this.props;
    return (
      <div className="graph-chip" style={{ width: this.state.shrink ? 0 : '85px', color: this.state.shrink ? '#e0e0e0' : '#383131' }}>
        <div className="graph-color graph-color-large" style={{ backgroundColor: color }}/>
        { title }
        {!last ?
        <div
          className="small-gray-btn"
          onClick={() => {
            this.setState({ shrink: true });
            this.timeout = setTimeout(() => { onDelete(); this.setState({shrink: false}) }, 100)}
          }
        >
          x
        </div>: null}
      </div>
    );
  }
};

export default GraphChip;