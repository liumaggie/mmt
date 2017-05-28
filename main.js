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

  const g = svg.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const timeFormat = d3.timeFormat('%H:%M:%S');

  const time = (d) => d.timeStr;
  const askPrice = (d) => d.bboList.ask;

  // console.log(d3.timeParse(data.bboList[0].timeStr));
  const x = d3.scaleTime()
                   .domain([d3.extent(data, time)])
                   .range([0, graphWidth]);

  const y = d3.scaleLinear()
                    .domain([d3.extent(data, askPrice)])
                    .range([graphHeight, 0]);

  const area = d3.area()
                 .x((d) => x(time(d)))
                 .y1((d) => y(askPrice(d)))
                 .y0(y(0));

  g.append('path')
    .datum(data)
    .attr('fill', 'steelblue')
    .attr('d', area);

  g.append("g")
      .attr("transform", "translate(0," + graphHeight + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)");
})();
