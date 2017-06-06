const d3 = require('d3');
const TradeList = require('./tradelist');
const PriceDisplay = require('./price-display');
const appleData = require('./stock_data/aapl.json');

const totalWidth = 1180;
const totalHeight = 620;
const margin = {top: 30, right: 30, bottom: 50, left: 60};
const graphWidth = totalWidth - margin.right - margin.left;
const graphHeight = totalHeight - margin.top - margin.bottom;
const currData = appleData;
let xScale, yScale;

const svg = d3.select('figure').append('svg')
  .attr('width', totalWidth)
  .attr('height', totalHeight)
  .style('border', '1px solid black');

const zoom = d3.zoom()
  .extent([[0, 0], [graphWidth, graphHeight]])
  .scaleExtent([1, 20])
  .translateExtent([[0, 0], [graphWidth, graphHeight]])
  .on('zoom', zoomed);

const view = svg.append("rect")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("fill", "none");

const g = svg.append('g')
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .attr("pointer-events", "all")
  .call(zoom);

const parseTime = d3.timeParse('%d-%b-%y');

const time = (d) => parseTime(d.Date);
const openPrice = (d) => d.Open;
const closePrice = (d) => d.Close;

const x = d3.scaleTime()
           .domain([d3.extent(currData, time)])
           .range([0, graphWidth]);

const y = d3.scaleLinear()
            .domain([d3.extent(currData, openPrice)])
            .range([graphHeight, 0]);

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

const openArea = d3.line()
                  // .curve(d3.curveStepAfter)
                  .x((d) => x(time(d)))
                  .y((d) => y(openPrice(d)));
                  // .y0(0);

const closeArea = d3.line()
                  // .curve(d3.curveStepAfter)
                  .x((d) => x(time(d)))
                  .y((d) => y(closePrice(d)));
                  // .y0(graphHeight);

x.domain(d3.extent(currData, time));
y.domain([d3.min(currData, openPrice) - 0.4, d3.max(currData, openPrice)]);


const openAreaPath = g.append('path')
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 1.5)
  .attr('clip-path', 'url(#clip)')
  .attr('class', 'askArea')
  // .on('mousemove', mousemove)
  // .on('mouseout', () => priceTooltip.style('display', 'none'));

const closeAreaPath = g.append('path')
  // .attr('fill', '#467349')
  .attr('clip-path', 'url(#clip)')
  // .on('mousemove', mousemove)
  // .on('mouseout', () => priceTooltip.style('display', 'none'));

// const tradeTooltip = d3.select('body').append('div')
//   .attr('class', 'tooltip trade-tooltip')
//   .style('display', 'none');
//
// const priceTooltip = d3.select('body').append('div')
//   .attr('class', 'tooltip price-tooltip')
//   .style('display', 'none');
//
// const askCircle = PriceDisplay.createMouseoverCircle(g, 'ask-circle');
// const bidCircle = PriceDisplay.createMouseoverCircle(g, 'bid-circle');
//
const xGroup = g.append("g")
  .attr("transform", `translate(0, ${graphHeight})`)
  .attr('class', 'x-axis');

const yGroup = g.append("g")
  .attr('class', 'y-axis');

yGroup.append("text")
  .attr("fill", "black")
  .attr("transform", "rotate(-90)")
  .attr("y", 13)
  .attr("text-anchor", "end")
  .text("Price ($)");

g.append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", graphWidth)
    .attr("height", graphHeight);

openAreaPath.datum(currData);
closeAreaPath.datum(currData);
view.call(zoom.transform, d3.zoomIdentity);
//
// TradeList.createTradeCircles(g, data, x, y, tradeTooltip, priceTooltip);
//
function zoomed() {
  const rescaleX = d3.event.transform.rescaleX(x);
  const rescaleY = d3.event.transform.rescaleY(y);
  xGroup.call(xAxis.scale(rescaleX));
  yGroup.call(yAxis.scale(rescaleY));
  openAreaPath.attr("d", openArea.x(function(d) { return rescaleX(time(d)); }));
  openAreaPath.attr('d', openArea.y(function(d) { return rescaleY(openPrice(d)); }));
  // closeAreaPath.attr("d", closeArea.x(function(d) { return rescaleX(time(d)); }));
  // closeAreaPath.attr('d', closeArea.y(function(d) { return rescaleY(closePrice(d)); }));

  // TradeList.rescaleCircles(g, rescaleX, rescaleY);

  // const askXValue = rescaleX.invert(d3.selectAll('.ask-circle')._groups[0][0].cx.animVal.value);
  // const bidXValue = rescaleX.invert(d3.selectAll('.bid-circle')._groups[0][0].cx.animVal.value);
  // const askYValue = PriceDisplay.calculateYValue(askXValue, data, time);
  // const bidYValue = PriceDisplay.calculateYValue(bidXValue, data, time);
  // PriceDisplay.updateCircles(askCircle, askXValue, askPrice(askYValue), rescaleX, rescaleY);
  // PriceDisplay.updateCircles(bidCircle, bidXValue, bidPrice(bidYValue), rescaleX, rescaleY);
  // xScale = rescaleX;
  // yScale = rescaleY;
}
//
// function mousemove() {
//   priceTooltip.style('display', null);
//
//   const xValue = xScale.invert(d3.mouse(this)[0]);
//   const yValue = PriceDisplay.calculateYValue(xValue, data, time);
//
//   PriceDisplay.updateCircles(askCircle, xValue, askPrice(yValue), xScale, yScale);
//   PriceDisplay.updateCircles(bidCircle, xValue, bidPrice(yValue), xScale, yScale);
//
//   priceTooltip.html(
//     `Ask Price: $${askPrice(yValue)}<br>
//     Bid Price: $${bidPrice(yValue)}`
//   )
//     .style('left', `${d3.event.pageX + 5}px`)
//     .style('top', `${d3.event.pageY - 28}px`);
// }
//
// TradeList.createToggleButton(svg, totalWidth, totalHeight);
