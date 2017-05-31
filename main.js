const d3 = require('d3');
const data = require('./stock.json');
const TradeList = require('./tradelist');
const PriceDisplay = require('./price-display');

const totalWidth = 1180;
const totalHeight = 620;
const margin = {top: 30, right: 30, bottom: 50, left: 60};
const graphWidth = totalWidth - margin.right - margin.left;
const graphHeight = totalHeight - margin.top - margin.bottom;

const svg = d3.select('figure').append('svg')
  .attr('width', totalWidth)
  .attr('height', totalHeight)
  .style('border', '1px solid black')
  .style('background-color', '#B7B792')

const zoom = d3.zoom()
  .extent([[0, 0], [graphWidth, graphHeight]])
  .scaleExtent([1, 8])
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

const parseTime = d3.timeParse('%H:%M:%S.%L');

const time = (d) => parseTime(d.timeStr);
const askPrice = (d) => d.ask/10000;
const bidPrice = (d) => d.bid/10000;

const x = d3.scaleTime()
           .domain([d3.extent(data.bboList, time)])
           .range([0, graphWidth]);

const y = d3.scaleLinear()
            .domain([d3.extent(data.bboList, askPrice)])
            .range([graphHeight, 0]);

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

const askArea = d3.area()
                  .curve(d3.curveStepAfter)
                  .x((d) => x(time(d)))
                  .y1((d) => y(askPrice(d)))
                  .y0(0);

const bidArea = d3.area()
                  .curve(d3.curveStepAfter)
                  .x((d) => x(time(d)))
                  .y1((d) => y(bidPrice(d)))
                  .y0(graphHeight);

x.domain(d3.extent(data.bboList, time));
y.domain([d3.min(data.bboList, askPrice) - 0.4, d3.max(data.bboList, askPrice)]);


const askAreaPath = g.append('path')
  .attr('fill', '#9A5E20')
  .attr('clip-path', 'url(#clip)')
  .attr('class', 'askArea')
  .on('mousemove', mousemove)
  .on('mouseout', () => { tooltip.style('display', 'none'); });

const bidAreaPath = g.append('path')
  .attr('fill', '#467349')
  .attr('clip-path', 'url(#clip)');

const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip');


const askCircle = PriceDisplay.createMouseoverCircle(g, 'ask-circle');
const bidCircle = PriceDisplay.createMouseoverCircle(g, 'bid-circle');

function mousemove() {
  tooltip.style('display', null);
  const xValue = x.invert(d3.mouse(this)[0]);
  const yValue = PriceDisplay.calculateYValue(xValue, data, time);

  PriceDisplay.updateCircles(askCircle, xValue, askPrice(yValue), x, y);
  PriceDisplay.updateCircles(bidCircle, xValue, bidPrice(yValue), x, y);

  tooltip.html(
    `Ask Price: $${askPrice(yValue)}<br>
    Bid Price: $${bidPrice(yValue)}`
  )
    .style('left', `${d3.event.pageX + 5}px`)
    .style('top', `${d3.event.pageY - 28}px`);
}

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

askAreaPath.datum(data.bboList);
bidAreaPath.datum(data.bboList);
view.call(zoom.transform, d3.zoomIdentity);

TradeList.createTradeCircles(g, data, x, y, tooltip);

function zoomed() {
  const rescaleX = d3.event.transform.rescaleX(x);
  const rescaleY = d3.event.transform.rescaleY(y);
  xGroup.call(xAxis.scale(rescaleX));
  yGroup.call(yAxis.scale(rescaleY));
  askAreaPath.attr("d", askArea.x(function(d) { return rescaleX(time(d)); }));
  askAreaPath.attr('d', askArea.y1(function(d) { return rescaleY(askPrice(d)); }));
  bidAreaPath.attr("d", bidArea.x(function(d) { return rescaleX(time(d)); }));
  bidAreaPath.attr('d', bidArea.y1(function(d) { return rescaleY(bidPrice(d)); }));

  TradeList.rescaleCircles(g, rescaleX, rescaleY);


  // const askXValue = rescaleX(d3.selectAll('.ask-circle')._groups[0][0].cx.animVal.value);
  // const bidXValue = rescaleX(d3.selectAll('.bid-circle')._groups[0][0].cx.animVal.value);
  // const askYValue = PriceDisplay.calculateYValue(askXValue, data, time);
  // const bidYValue = PriceDisplay.calculateYValue(bidXValue, data, time);
  // PriceDisplay.updateCircles(askCircle, askXValue, askPrice(askYValue), rescaleX, rescaleY);
  // PriceDisplay.updateCircles(bidCircle, bidXValue, bidPrice(bidYValue), rescaleX, rescaleY);
}
