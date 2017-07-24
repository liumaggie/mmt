const d3 = require('d3');
const PriceDisplay = require('./price-display');
const appleData = require('../stock_data/aapl.json');
const fbData = require('../stock_data/fb.json');
const googData = require('../stock_data/goog.json');
const msftData = require('../stock_data/msft.json');

const totalWidth = 1180;
const totalHeight = 500;
const margin = {top: 30, right: 30, bottom: 50, left: 60};
const graphWidth = totalWidth - margin.right - margin.left;
const graphHeight = totalHeight - margin.top - margin.bottom;
appleData.reverse();
fbData.reverse();
googData.reverse();
msftData.reverse();
let currData;
let xScale, yScale;

$('button').click((e) => {
  $('figure').empty();

  const clickedCompany = e.currentTarget.innerHTML
  switch(clickedCompany) {
    case 'APPLE':
      currData = appleData;
      break;
    case 'FACEBOOK':
      currData = fbData;
      break;
    case 'GOOGLE':
      currData = googData;
      break;
    case 'MICROSOFT':
      currData = msftData;
      break;
  }

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
  .x((d) => x(time(d)))
  .y((d) => y(openPrice(d)))
  .curve(d3.curveStep);

  const closeArea = d3.line()
  .x((d) => x(time(d)))
  .y((d) => y(closePrice(d)))
  .curve(d3.curveStep);

  x.domain(d3.extent(currData, time));
  y.domain(
    [d3.min(currData, openPrice) - 5,
     d3.max(currData, openPrice) + 1]
   );


  const openAreaPath = g.append('path')
  .attr("fill", "none")
  .attr("stroke", "#F28F20")
  .attr("stroke-width", 1.5)
  .attr('clip-path', 'url(#clip)')
  .attr('class', 'askArea')
  .on('mousemove', mousemove)
  .on('mouseout', () => toolTip.style('display', 'none'));

  const closeAreaPath = g.append('path')
  .attr("fill", "none")
  .attr("stroke", "#2072B2")
  .attr("stroke-width", 1.5)
  .attr('clip-path', 'url(#clip)')
  .on('mousemove', mousemove)
  .on('mouseout', () => toolTip.style('display', 'none'));

  const toolTip = d3.select('figure').append('div')
  .attr('class', 'tooltip')
  .style('display', 'none');

  const openCircle = PriceDisplay.createMouseoverCircle(g, 'open-circle');
  const closeCircle = PriceDisplay.createMouseoverCircle(g, 'close-circle');

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

  const legend = g.append('g')

  legend.append('rect')
    .attr("x", graphWidth - 100)
    .attr("y", graphHeight - 30)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", '#2072B2');

  legend.append('text')
    .attr("x", graphWidth - 80)
    .attr("y", graphHeight - 38)
    .text("Open Price")

  legend.append('rect')
    .attr("x", graphWidth - 100)
    .attr("y", graphHeight - 48)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", '#F28F20');

  legend.append('text')
    .attr("x", graphWidth - 80)
    .attr("y", graphHeight - 20)
    .text("Close Price")

  function zoomed() {
    const rescaleX = d3.event.transform.rescaleX(x);
    const rescaleY = d3.event.transform.rescaleY(y);
    xGroup.call(xAxis.scale(rescaleX));
    yGroup.call(yAxis.scale(rescaleY));
    openAreaPath.attr("d",
      openArea.x(function(d) { return rescaleX(time(d)); }));
    openAreaPath.attr('d',
      openArea.y(function(d) { return rescaleY(openPrice(d)); }));
    closeAreaPath.attr("d",
      closeArea.x(function(d) { return rescaleX(time(d)); }));
    closeAreaPath.attr('d',
      closeArea.y(function(d) { return rescaleY(closePrice(d)); }));

    const openXValue = rescaleX.invert(d3.selectAll('.open-circle')._groups[0][0].cx.animVal.value);
    const closeXValue = rescaleX.invert(d3.selectAll('.close-circle')._groups[0][0].cx.animVal.value);

    const openYValue = PriceDisplay.calculateYValue(openXValue, currData, time);
    const closeYValue = PriceDisplay.calculateYValue(closeXValue, currData, time);
    PriceDisplay.updateCircles(openCircle, openXValue, openPrice(openYValue), rescaleX, rescaleY);
    PriceDisplay.updateCircles(closeCircle, closeXValue, closePrice(closeYValue), rescaleX, rescaleY);
    xScale = rescaleX;
    yScale = rescaleY;

  }

  function mousemove() {
    toolTip.style('display', null);

    const xValue = xScale.invert(d3.mouse(this)[0]);
    const yValue = PriceDisplay.calculateYValue(xValue, currData, time);

    const openY = openPrice(yValue)
    const closeY = closePrice(yValue)
    const yScaleStart = yScale.domain()[0]
    const yScaleEnd = yScale.domain()[1]

    if (openY >= yScaleStart && openY <= yScaleEnd
      && closeY >= yScaleStart && closeY <= yScaleEnd) {
        PriceDisplay.updateCircles(openCircle, xValue, openPrice(yValue), xScale, yScale);
        PriceDisplay.updateCircles(closeCircle, xValue, closePrice(yValue), xScale, yScale);

        toolTip.html(
          `Open Price: $${openPrice(yValue)}<br>
          Close Price: $${closePrice(yValue)}`
        )
        .style('left', `${d3.event.pageX + 5}px`)
        .style('top', `${d3.event.pageY - 28}px`);
      }

    }
})
