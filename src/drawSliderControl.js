/* global d3 */
import fade from './fade';

export default function drawSliderControl(props) {
  const selector = props.selector;
  const padding = props.padding;
  const defaultMarkOpacity = props.defaultMarkOpacity;
  const defaultLinkOpacity = props.defaultLinkOpacity;
  const defaultLabelOpacity = props.defaultLabelOpacity;

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

    d3.selectAll('.link')
      .style('stroke-opacity', d => {
        // console.log('d from slider update', d);
        if (d.weight < sliderValue) {
          return 0;
        }
        return defaultLinkOpacity;
      });

    d3.selectAll('.mark')
      .style('fill-opacity', d => {
        // first style the label associated with the mark
        // console.log('d from mark selection', d);
        d3.select(`#node${d.id}`).selectAll('.label')
          .style('fill-opacity', () => {
            if (d.maxLinkWeight < sliderValue) {
              return 0.1;
            }
            return defaultLabelOpacity;
          });

        // then style the mark itself
        if (d.maxLinkWeight < sliderValue) {
          return 0.1;
        }
        return defaultMarkOpacity;
      });

  }
}
