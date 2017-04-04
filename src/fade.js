/* global d3 */

export default function fade(props) {
  const opacity = props.opacity;
  const ignoreLinks = props.ignoreLinks;

  const node = props.node;
  const link = props.link;
  const isConnected = props.isConnected;

  return d => {
    node.style('stroke-opacity', function (o) {
        // console.log('o from fade node.style', o);
        // console.log('isConnected(d, o)', isConnected(d, o));
        // const thisOpacity = isConnected(d, o) ? defaultOpacity : opacity;
        // console.log('thisOpacity from fade node.style', thisOpacity);
        // console.log('this from fade node.style', this);

        // style the mark circle
        // console.log('this.id', this.id);
        // this.setAttribute('fill-opacity', thisOpacity);
      const defaultMarkOpacity = 0.4;
      d3.select(`#${this.id}`).selectAll('.mark')
          .style('fill-opacity', p => {
            // console.log('p from fade mark', p);
            // console.log('isConnected(d, p) mark', isConnected(d, p));
            const markOpacity = isConnected(d, p) ? defaultMarkOpacity : opacity;
            // console.log('markOpacity', markOpacity);
            return markOpacity;
          });

        // style the label text
      const defaultLabelOpacity = 1;
      d3.select(`#${this.id}`).selectAll('.label')
          .style('fill-opacity', p => {
            // console.log('p from fade label', p);
            // console.log('isConnected(d, p) label', isConnected(d, p));
            let labelOpacity = 1;
            if (!isConnected(d, p) && (opacity !== defaultMarkOpacity)) {
              labelOpacity = opacity;
            }
            // console.log('labelOpacity', labelOpacity);
            return labelOpacity;
          });

      return 1;
    });

    if (typeof ignoreLinks === 'undefined') {
        // style the link lines
      const defaultLinkOpacity = 0.4;
      link.style('stroke-opacity', o => {
          // console.log('o from fade link style', o);
          // console.log('d from fade link style', d);
        if (o.source.id === d.id || o.target.id === d.id) {
          return defaultLinkOpacity;
        }
        return opacity;
      });
      link.attr('marker-end', o => {
        if (opacity === defaultLinkOpacity || o.source.id === d.id || o.target.id === d.id) {
          return 'url(#end-arrow)';
        }
        return 'url(#end-arrow-fade)';
      });
    }
  };
}
