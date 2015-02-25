$(document ).ready(function() {

    (function(){

        var dataGraph = [];
        var treesCollection = {};
        var callIncr = 0;
        var callAmnt = 5;

        var updateGraph = function(data) {
            dataGraph = dataGraph.concat(data);

            d3.select('.graph')
                .selectAll('circle')
                .data(dataGraph)
                .enter()
                .append('circle')
                .attr({
                    'class': function(d){return 'coordPoint';},
                    'opacity': function(d){return d.state;},
                    'cy': function(d){return d.y + 'px';},
                    'cx': function(d){return d.x + 'px';},
                    'r': 2
                })
                .style({'fill': function(d){return d.color;}});
        };

        var setStyles = function(data) {

            d3.select('.graph')
                .selectAll('circle')
                .attr({
                    'opacity': function(d){return d.state;}
                });
        };

        var setTreesColorsByTypes = function(trees){
            //console.log(treesCollection);
            //console.log(_.indexBy(_.pluck(_.flatten(trees, 'fields'), 'espece').sort()));
            //var newCollec = _.pluck(_.flatten(trees, 'fields'), 'espece').sort();
            var newCollec = _.indexBy(_.pluck(_.flatten(trees, 'fields'), 'espece').sort());

            treesCollection = _.merge(newCollec, treesCollection)


            //.sort();


            callIncr++;
            //alert(callIncr);

            if (callIncr === callAmnt) {

                _.forEach(treesCollection, function(key){

                    treesCollection[key] = {label:key}
                    treesCollection[key].rgb = 'rgb(' + parseInt(Math.random()*255) + ', ' +parseInt(Math.random()*255) + ', ' + parseInt(Math.random()*255) +')';

                });

                createSelect(treesCollection);
            }
        };

        var getColorsByType = function(type){
            var value = treesCollection[type];
            return value.rgb;
        };

        var callAPI = function(dataQuery, index, callback){
            var urlAPI = 'http://opendata.paris.fr/api/records/1.0/search?dataset=les-arbres&rows=1000';
            urlAPI = urlAPI+'&start='+index;
            $.getJSON( urlAPI, {
              tagmode: 'any',
              format: 'json',
              facet: dataQuery
            })
            .done(function(data) {
                callback(data);
                return data;
            });

        };

        var getObject = function(tree){
           var initYstart = 48.914523;
           var initYend = 48.79427;
           var initXstart = 2.469981;
           var initXend = 2.220573;

           var w = 600;
           var h = 400;


            var color =getColorsByType(tree.type);


           return {
              x : w/(initXstart-initXend)*(tree.x - initXend),
              y : - (h/(initYstart-initYend)*(tree.y - initYend)),
              color: color,
              state: tree.state,
              type : tree.type
           };
        };

        var call = function(index){
            callAPI('espece',index, function(data){
                var records = data.records;
                var treesInPX = [];

                //set trees colors by types
                setTreesColorsByTypes(records);

                for (var i = 0; i < records.length; i++) {
                    var treeSpec = {
                        'x': records[i].geometry.coordinates[0],
                        'y': records[i].geometry.coordinates[1],
                        'type': records[i].fields.espece,
                        'state': 1
                    };
                    treesInPX.push(getObject(treeSpec));
                }
                updateGraph(treesInPX);

            });
        };

        var createSelect = function(trees){

                    //sortTreeList(trees);

            var createOpt = function(val, name){
                return $('<option value="' + val + '">' + name + '</option>');
            };
            var select = $('#selectTrees').length === 0 ? $('<select id="selectTrees"></select>') : $('#selectTrees');

            select.append(createOpt('All trees', 'Everything'));


            _.forEach(treesCollection, function(object){
               select.append(createOpt(object.rgb, object.label));
            });


               console.log(treesCollection)

            select.on('change', function(){

                    for (var i = 0; i < dataGraph.length; i++) {
                        dataGraph[i].state = 0;
                        if (dataGraph[i].type === this.label){
                            dataGraph[i].state = 1;
                        } else if (this.value === 'All trees') {
                            dataGraph[i].state = 1;
                        }
                    }


                    setStyles(dataGraph);
                    $('#user-info h1').html(this.label);
                    $('#user-info .treeCount').html('Count : '+ $('.coordPoint[opacity="1"]').length);

            });

            $('#user-params').append(select);
        };


        for (var i = 0; i < callAmnt; i++) {
            call(i*1000);
        }

    })();
});
