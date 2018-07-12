/**
 * SERVICES
 */

/* Calculates change rate from a numerical point to it's initial point */
const CalculateChangePercentage = ((point: number, initialPoint: number, precision: number): number => {
  return parseFloat((((point - initialPoint) / point) * 100).toFixed(precision));
});

export default CalculateChangePercentage;