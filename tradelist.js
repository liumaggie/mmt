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

const handleMouseover = (tooltip, pricetooltip, d) => {
  pricetooltip.style('display', 'none');
  tooltip.style('display', null);
  tooltip.transition().duration(200);
  tooltip.html(
    `Price: $${price(d)}<br>
    Shares: ${d.shares}<br>
    Trade Type: ${d.tradeType}<br>
    Order: ${d.orderReferenceNumber}`
  )
    .style('left', `${d3.event.pageX + 10}px`)
    .style('top', `${d3.event.pageY - 60}px`);
};

const handleMouseout = (tooltip) => {
  tooltip.style('display', 'none');
};

exports.createTradeCircles = (g, data, x, y, tooltip, pricetooltip) => {
  g.selectAll('.dot')
    .data(data.tradeList)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', (d) => {
      if (d.shares <= 50) {
        return 0.5;
      } else if (d.shares < 100) {
        return 1;
      } else if (d.shares < 200) {
        return 1.5;
      } else {
        return 3;
      }
    })
    .attr('cx', (d) => x(time(d)))
    .attr('cy', (d) => y(price(d)))
    .style('fill', (d) => d.tradeType === 'P' ? '#CB5D6B' : '#000')
    .on('mouseover', (d) => handleMouseover(tooltip, pricetooltip, d))
    .on('mouseout', (d) => handleMouseout(tooltip));
};

exports.rescaleCircles = (g, x, y) => {
  g.selectAll('.dot')
  .attr('clip-path', 'url(#clip)')
  .attr('cx', (d) => x(time(d)))
  .attr('cy', (d) => y(price(d)));
};

exports.createToggleButton = (g, width, height) => {
  const btn = g.append('g').attr('class', 'btn').attr('transform', 'translate(10,10)');
  const btnBg = btn.append('rect')
    .attr('width', 100)
    .attr('height', 20)
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('x', width - 150)
    .attr('y', 30);
  btn.append('text').attr('x', width - 138).attr('y', 43).text('Toggle Trades');
  btn.on('click', () => {
    if (g.selectAll('.dot').style('display') === 'none') {
      g.selectAll('.dot').style('display', 'block');
    } else {
      g.selectAll('.dot').style('display', 'none');
    }
  });
};
