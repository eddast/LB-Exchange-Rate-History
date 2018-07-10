import * as React from 'react';

/**
 * GRAPHCHIP COMPONENT
 * Deletes chosen exhange history entry from chart
 * and shows color
 */
interface GraphChipState {
  shrink: boolean;				  /* true if chip should shrink */
}
interface GraphChipProps {
  title: string;				   /* chip title */
  color: string;				   /* chip color */
  onDelete: any;				   /* function, action when chip is deleted */
  last: boolean;            /* true if chip is last of his kind */ 
}
class GraphChip extends React.Component <GraphChipProps, GraphChipState> {
  componentWillMount(): void {
    this.setState({ shrink: false });
  }
  render(): JSX.Element {
    const { title, color, onDelete, last } = this.props;
    return (
      <div className="graph-chip" style={{ width: this.state.shrink ? 0 : '85px', color: this.state.shrink ? '#e0e0e0' : '#383131' }}>
        <div className="graph-chip-color" style={{ backgroundColor: color }}/>
        { title }
        {!last ?
        <div
          className="small-gray-btn"
          onClick={() => { this.setState({ shrink: true }); setTimeout(() => { onDelete(); this.setState({shrink: false}) }, 200)}}
        >
          x
        </div>: null}
      </div>
    );
  }
};

export default GraphChip;