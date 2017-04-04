/* global d3 */

export default function drawSliderControl(props) {
  const selector = props.selector;
  const padding = props.padding;
  const defaultMarkOpacity = props.defaultMarkOpacity;
  const defaultStrokeOpacity = props.defaultStrokeOpacity;

  d3.select(selector).append('input')
  .attr('type', 'range')
  .attr('min', 0)
  .attr('max', 1)
  .attr('value', 0.356)
  .attr('step', 0.001)
  .style('top', '604px')
  .style('left', '90px')
  .style('height', '36px')
  .style('width', '450px')
  .style('position', 'fixed')
  .attr('id', 'slider');

  d3.select('#slider')
    .on('input', function () {
      update(+this.value);
    });

  function update(sliderValue) {
    console.log('sliderValue', sliderValue);
    // adjust the text on the range slider
    d3.select('#nRadius-value').text(sliderValue);
    d3.select('#nRadius').property('value', sliderValue);

    // update the circle radius
    d3.selectAll('.link')
      .style('stroke-opacity', d => {
        // console.log('d from slider update', d);
        if (d.weight < sliderValue) {
          return 0;
        }
        return defaultStrokeOpacity;
      });
  }
}
