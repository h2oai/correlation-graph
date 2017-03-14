a visualization that draws a correlation network from pairwise correlations calculated by the `vis-data-server` for the `airlines_all` dataset as aggregated by *h2o-3*

draws from a graph.json file

this iteration adds community detection with [jLouvain](https://github.com/upphiminn/jLouvain)

#### API 

*fixedNodeSize* if `true`, nodes and node labels are all the same size. if `undefined` or otherwise unspecified, nodes and node labels are sized by the number of incoming relationships that node has (the `in-degree` of that node)