const d3 = require('d3');
const data = require('./stock.json');

(() => {
  const totalWidth = 1180;
  const totalHeight = 620;
  const margin = {top: 30, right: 30, bottom: 50, left: 60};
  const graphWidth = totalWidth - margin.right - margin.left;
  const graphHeight = totalHeight - margin.top - margin.bottom;

  const svg = d3.select('figure').append('svg')
    .attr('width', totalWidth)
    .attr('height', totalHeight)
    .style('border', '1px solid black');

  const g = svg.append('g')
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  const parseTime = d3.timeParse('%H:%M:%S.%L');

  const time = (d) => parseTime(d.timeStr);
  const askPrice = (d) => d.ask/10000;

  console.log(parseTime('09:30:00.000'));
  const x = d3.scaleTime()
                   .domain([d3.extent(data.bboList, time)])
                   .range([0, graphWidth]);

  const y = d3.scaleLinear()
                    .domain([d3.extent(data.bboList, askPrice)])
                    .range([graphHeight, 0]);

  const area = d3.area()
                 .x((d) => x(time(d)))
                 .y1((d) => y(askPrice(d)))
                 .y0(y(0));

  const line = d3.line()
                 .x((d) => x(time(d)))
                 .y((d) => y(askPrice(d)))
                 .curve(d3.curveStepAfter());

  x.domain(d3.extent(data.bboList, time));
  y.domain([d3.min(data.bboList, askPrice) - 0.4, d3.max(data.bboList, askPrice)]);

  g.append('path')
    .data(data)
    .attr('fill', 'steelblue')
    .attr('d', area);

  g.append("g")
      .attr("transform", "translate(0," + graphHeight + ")")
      .call(d3.axisBottom(x));

  g.append("g")
    .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)");
})();
