const d3 = require('d3');

exports.createMouseoverCircle = (g, className) => {
  return (g.append('circle')
    .attr('class', className)
    .attr('r', 3)
    .attr('display', 'none'));
};

exports.updateCircles = (circle, x0, y0, xScale, yScale) => {
  circle.attr('display', 'block')
        .attr('cx', xScale(x0))
        .attr('cy', yScale(y0));
};

exports.calculateYValue = (xValue, data, time) => {
  const bisect = d3.bisector((d) => time(d)).left;
  const idx = bisect(data.bboList, xValue, 1);
  const d0 = data.bboList[idx-1];
  const d1 = data.bboList[idx];
  const yValue = xValue - time(d0) > time(d1) - xValue ? d1 : d0;
  return yValue;
};

exports.rescaleCircles = (g, xScale, yScale, time, askPrice, bidPrice) => {
  g.selectAll('.askCircle')
  .attr('clip-path', 'url(#clip)')
  .attr('cx', (d) => xScale(time(d)))
  .attr('cy', (d) => yScale(askPrice(d)));

  g.selectAll('.bidCircle')
  .attr('clip-path', 'url(#clip)')
  .attr('cx', (d) => xScale(time(d)))
  .attr('cy', (d) => yScale(bidPrice(d)));
};
