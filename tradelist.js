const d3 = require('d3');

const convertTime = (nano) => {
  const totalSeconds = nano / Math.pow(10, 9);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor((totalSeconds % 3600) % 60 * 1000)/1000;
  return `${hours}:${minutes}:${seconds}`;
};

const parseTime = d3.timeParse('%H:%M:%S.%L');
let time = (d) => parseTime(convertTime(d.time));
let price = (d) => d.price/10000;

exports.createTradeCircles = (g, data, x, y, tooltip) => {
  g.selectAll('circle')
    .data(data.tradeList)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 2)
    .attr('cx', (d) => x(time(d)))
    .attr('cy', (d) => y(price(d)))
    .style('fill', (d) => d.tradeType === 'P' ? '#CB5D6B' : '#000')
    .on('mouseover', (d) => {
      tooltip.transition().duration(200);
      tooltip.html(
        `Price: $${price(d)}<br>
        Shares: ${d.shares}`
      )
        .style('left', `${d3.event.pageX + 5}px`)
        .style('top', `${d3.event.pageY - 28}px`);
    });
};

exports.rescaleCircles = (g, x, y) => {
  g.selectAll('circle')
  .attr('clip-path', 'url(#clip)')
  .attr('cx', (d) => x(time(d)))
  .attr('cy', (d) => y(price(d)));
};
