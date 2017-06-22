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
        .attr('cy', yScale(y0))
        .attr('x-scale', xScale)
        .attr('y-scale', yScale);
};

exports.calculateYValue = (xValue, data, time) => {
  const bisect = d3.bisector((d) => time(d)).left;
  const idx = bisect(data, xValue, 1);
  const d0 = data[idx-1];
  const d1 = data[idx];
  const yValue = xValue - time(d0) > time(d1) - xValue ? d1 : d0;
  return yValue;
};
