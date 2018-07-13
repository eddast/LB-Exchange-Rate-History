# Exchange Rate History Visualizer for Landsbankinn
Small React TypeScript project for Landsbankinn, implements an exchange rate history for comparing one or more tuples of currencies by visualization via interactive SVG line chart and via extracting most significant values to display in an interactive sortable table. Version of implementation available on [CodePen](https://codepen.io/eddast/pen/RBWGqP).

## Installation and running the App
External dependencies for the project must be installed for it to work. This is achieved by using npm or yarn, both of which can be downloaded from https://www.npmjs.com/get-npm or installed in the terminal on a linux based OS or installed via node: 

```bash
username$ pwd
~/.../LB-Exchange-Rate-History
username$ yarn install
```
Then to run the program, one can use yarn start or npm start. On npm start, the project will be hosted at https://localhost:8080:

```bash
username$ pwd
~/.../LB-Exchange-Rate-History
username$ yarn start
```
## The Exchange Rates Data Used
All data fetched by this program belongs to Landsbankinn

## Information Displayed in Application
* Top-left area app panel displays add menu enabling user to add comparison to app.
* Top-right area of app displays all active comparisons in the form of small chips which show given comparison's color and their shortened currencies ID.
* Below add menu and active comparisons, options are displayed for user to change data's time period range, both in the form of input boxes (to show range and to input custom range) and, for a chosen predefined ranges, a period range slider.
* Below add and change date range options line chart is displayed that shows mid (miðgengi) and dates for all points of comparison IF only a single comparison is active, otherwise the line chart shows the difference between point's mid and point's starting mid and the dates.
* When user hovers over a graph in the line chart, a tooltip appears providing details of which data is being displayed, mid, change from initial mid, etc.
* Below the line chart a currency rate table is displayed for all comparisons, showing initial mid for period, end mid for period, lowest mid of period, highest mid of period and change from initial mid to end mid in percentages.

## Interaction with Application
* User can add comparison to app, and will be notified when new comparison is being added via load spinner and will explicitly know when new comparison is ready as a new comparison chip indicator appears that identifies the new comparison and both line chart and rates table are updated
* User can remove comparison from app by clicking the 'x' button on a comparison chip or in the currency rate table. Once clicked, remove is instant
* User can change the time period of data, either choose a custom valid rang or a predefined shortcut range by clicking a point in the range slider. Once new period is chosen, data is refetched and load spinner covers data visualizations. While data is being re-fetched, user cannot add a new comparison to app nor change the time period.

## Sample screenshot
![alt text](https://image.ibb.co/h12sZ8/screencapture_localhost_8080_2018_07_13_12_09_56.png "Exchange rate history app") 
