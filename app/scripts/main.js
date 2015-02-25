$(document ).ready(function() {

var dataTrees = {
    species: [],
    trees: []
};

// API Call setup vars
var callIncr = 0;
var callAmnt = 12;
var callRows = '10000';

// Graph axes setup vars
var initYstart = 48.914523;
var initYend = 48.79427;
var initXstart = 2.469981;
var initXend = 2.220573;

var width = 600;
var height = 400;



var createSelect = function(){

    var createOption = function(val, name){
        return $('<option value="' + val + '">' + name + '</option>');
    };

    var select = $('#selectTrees').length === 0 ? $('<select id="selectTrees"></select>') : $('#selectTrees');

    select.append(createOption('All trees', 'Everything'));

    _.forEach(dataTrees.species, function(object){
        if (object.label !== undefined) {
            select.append(createOption(object.rgb, object.label));
        }
    });


    select.on('change', function(){

        for (var i = 0; i < dataTrees.trees.length; i++) {
            dataTrees.trees[i].state = 0;

            if (dataTrees.trees[i].label === this.options[this.selectedIndex].text) {
                dataTrees.trees[i].state = 1;
            } else if (this.value === 'All trees') {
                dataTrees.trees[i].state = 1;
            }
        }

        setColors(dataTrees.trees);
        $('#user-info h1').html(this.label);
        $('#user-info .treeCount').html('Count : '+ $('.coordPoint[opacity="1"]').length);

    });

    $('#user-params').append(select);
};

var updateGraph = function() {

    d3.select('.graph')
        .selectAll('circle')
        .data(dataTrees.trees)
        .enter()
        .append('circle')
        .attr({
            'class': 'coordPoint',
            'opacity': function(d){return d.state;},
            'cy': function(d){return d.y + 'px';},
            'cx': function(d){return d.x + 'px';},
            'r': 2
        })
        .style({'fill': function(d){return d.color;}});
};

var setColors = function(data) {

    d3.select('.graph')
        .selectAll('circle')
        .attr({
            'opacity': function(d){return d.state;}
        });
};

var createColors = function(){

    for (var i = dataTrees.species.length - 1; i >= 0; i--) {
        var color = 'rgb(' + parseInt(Math.random()*255) + ', ' +parseInt(Math.random()*255) + ', ' + parseInt(Math.random()*255) +')';
        dataTrees.species[i].rgb = color;

        for (var j = dataTrees.trees.length - 1; j >= 0; j--) {
            if (dataTrees.trees[j].label == dataTrees.species[i].label) {
                dataTrees.trees[j].color = color;
            }
        };
    };

//////! TO SOLVE !\\\\\\\
    /*for (var i = dataTrees.trees.length - 1; i >= 0; i--) {
        if (dataTrees.trees[i].color.length < 1) {
            console.log('////////////////////////////////////////');
            console.log('////////////////////////////////////////');
            console.log('Missing value ! For : ' + dataTrees.trees[i].label);
            console.log('////////////////////////////////////////');
            console.log('////////////////////////////////////////');
        }
        console.log(dataTrees.trees[i].label + ' : ' + dataTrees.trees[i].color + ' : ' + i);
    };*/
}

var getData = function(){

    var getPx = function(coord, type){

       if (type === 1) {
        return width/(initXstart-initXend)*(coord - initXend);
       } else if (type === 0) {
        return - (height/(initYstart-initYend)*(coord - initYend));
       } else {
        console.log('ca passe pas ! :' + type + ' : ' + coord)
       }
    };

    var setDataTrees = function(records) {

        var tempTreeSpecies = [];
        var tempTrees = [];

        for (var i = records.length - 1; i >= 0; i--) {
            tempTreeSpecies[i] = {
                label: records[i].fields.espece,
                rgb: i
            };

            tempTrees[i] = {
                label: records[i].fields.espece,
                state: 1,
                color: "",
                x: getPx(records[i].fields.geo_point_2d[1], 1),
                y: getPx(records[i].fields.geo_point_2d[0], 0)
            };

        };

        dataTrees.species =  _.sortBy(_.uniq(_.merge(dataTrees.species, tempTreeSpecies), 'label'), 'label');
        dataTrees.trees = dataTrees.trees.concat(tempTrees);

        callIncr++;

        if (callIncr === callAmnt) {
            createColors();
            createSelect();
            updateGraph();
        }

    }


    var callAPI = function(dataQuery, index, callback){
        var urlAPI = 'http://opendata.paris.fr/api/records/1.0/search?dataset=les-arbres&facet=espece&rows='+ callRows;
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

    var call = function(index){
        callAPI('espece',index, function(data){
            var records = data.records;
            setDataTrees(records);
        });
    };

    for (var i = 0; i < callAmnt; i++) {
        call(i*1000);
    }
}

getData();

});