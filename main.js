const d3 = require('d3');
const data = require('./stock.json');
const TradeList = require('./tradelist');

(() => {
  const totalWidth = 1180;
  const totalHeight = 620;
  const margin = {top: 30, right: 30, bottom: 50, left: 60};
  const graphWidth = totalWidth - margin.right - margin.left;
  const graphHeight = totalHeight - margin.top - margin.bottom;

  const svg = d3.select('figure').append('svg')
    .attr('width', totalWidth)
    .attr('height', totalHeight)
    .style('border', '1px solid black')
    .style('background-color', '#B7B792');

  const g = svg.append('g')
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

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
                  // .x((d) => x(time(d)))
                  .y1((d) => y(bidPrice(d)))
                  .y0(graphHeight);

  x.domain(d3.extent(data.bboList, time));
  y.domain([d3.min(data.bboList, askPrice) - 0.4, d3.max(data.bboList, askPrice)]);

  const askAreaPath = g.append('path')
    .attr('fill', '#9A5E20')
    .attr('clip-path', 'url(#clip)');

  const bidAreaPath = g.append('path')
    .attr('fill', '#467349')
    .attr('clip-path', 'url(#clip)');

  const xGroup = g.append("g")
    .attr("transform", `translate(0, ${graphHeight})`)
    .attr('class', 'x-axis');

  const yGroup = g.append("g")
    .attr('class', 'y-axis');


  const zoom = d3.zoom()
  .extent([[0, 0], [graphWidth, graphHeight]])
  .scaleExtent([1, 8])
  .translateExtent([[0, 0], [graphWidth, graphHeight]])
  .on('zoom', zoomed);

  var view = svg.append("rect")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .call(zoom);

  g.append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", graphWidth)
      .attr("height", graphHeight);

  TradeList.createTradeCircles(g, data, x, y);
  // const xExtent = d3.extent(data.bboList, time);
  // const yExtent = d3.extent(data.bboList, askPrice);
  // zoom.translateExtent([[x(xExtent[0]), -Infinity], [x(xExtent[1]), Infinity]])

  askAreaPath.datum(data.bboList);
  bidAreaPath.datum(data.bboList);
  view.call(zoom.transform, d3.zoomIdentity);

  function zoomed() {
    // view.attr('transform', d3.event.transform);
    const rescaleX = d3.event.transform.rescaleX(x);
    const rescaleY = d3.event.transform.rescaleY(y);
    xGroup.call(xAxis.scale(rescaleX));
    yGroup.call(yAxis.scale(rescaleY))
          .append("text")
            .attr("fill", "black")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Price ($)");
    askAreaPath.attr("d", askArea.x(function(d) { return rescaleX(time(d)); }));
    askAreaPath.attr('d', askArea.y1(function(d) { return rescaleY(askPrice(d)); }));
    bidAreaPath.attr("d", bidArea.x(function(d) { return rescaleX(time(d)); }));
    bidAreaPath.attr('d', bidArea.y1(function(d) { return rescaleY(bidPrice(d)); }));

    TradeList.rescaleCircles(g, rescaleX, rescaleY);
  }
})();
