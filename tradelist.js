const d3 = require('d3');

const convertTime = (nano) => {
  const totalSeconds = nano / Math.pow(10, 9);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor((totalSeconds % 3600) % 60 * 1000)/1000;
  return `${hours}:${minutes}:${seconds}`;
};

exports.createTradeCircles = (g, data, x, y) => {
  const parseTime = d3.timeParse('%H:%M:%S.%L');

  const time = (d) => parseTime(convertTime(d.time));
  const price = (d) => d.price/10000;

  g.selectAll('circle')
    .data(data.tradeList)
    .enter()
    .append('circle')
    .attr('r', 2)
    .attr('cx', (d) => x(time(d)))
    .attr('cy', (d) => y(price(d)))
    .style('fill', (d) => d.tradeType === 'P' ? '#CB5D6B' : '#000');
};
