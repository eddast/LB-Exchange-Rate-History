/* interfaces */
interface ExchangeRateComparisonData {
  source: string,         /* data source */
  baseCurrency: string,   /* base comparison currency ID */
  quoteCurrency: string,  /* target comparison currency ID */
  buy: number,            /* buy rates of comparison */ 
  sell: number,           /* sell rates of comparison */
  mid: number,            /* mid rate of comparison (miðgildi) */
  date: string            /* date string of exchange rate data */
}
interface CurrencyOption {
  id: string,             /* 3 letter ID string for currency */
  name: string            /* Currency full name */
}
export {
  ExchangeRateComparisonData,
  CurrencyOption
}