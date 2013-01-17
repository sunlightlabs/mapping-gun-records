var states_info;
var focused_states;

var intro_caption = "<h1>Rootin' Tootin' Contributin'</h1><p><b>Click on any state on the left to learn more about the availability of gun ownership data in that state</b></p><p>You'll notice that many of these states are lacking full information about the availability of their data. Please contact the Sunlight Foundation if you can offer more insight into the facts around any state's laws.</p>"

$('#caption').html(intro_caption)

$.getJSON('states_info.json',function(data){
    states_info = data;
    focused_states = Object.keys(states_info);
})

$.getJSON('state_data.json',function(data){
    states_data = data;
})

var zoomed = false;

var width = 600,
    height = 500,
    centered;

//var quantile = d3.scale.quantile().domain([0,600000]).range(d3.range(6).map(function(i){return "q" + i + "-6";}));

var ordinal = d3.scale.ordinal().domain(["Yes","Unclear","No"]).range(["publicYes","publicUnclear","publicNo"]);

var projection = d3.geo.albersUsa()
    .scale(width+(0.14*width))
    .translate([((0.14*width)/2), -80]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#mapContainer").append("svg")
    .attr("width", width)
    .attr("height", height);


/* PATTERNS 
var defs = svg.append("defs")

var naPattern = defs.append("pattern")
    .attr("width",5)
    .attr("height",5)
    .attr("id","naPattern")
    .attr("patternUnits","userSpaceOnUse");

naPattern.append("line")
      .attr("x1",3)
      .attr("y1",-1)
      .attr("x2",-1)
      .attr("y2",3)
      .attr("stroke","black")
      .attr("stroke-width","1")
      .attr("stroke-opacity","0.4");

naPattern.append("line")
      .attr("x1",6)
      .attr("y1",1)
      .attr("x2",1)
      .attr("y2",6)
      .attr("stroke","black")
      .attr("stroke-width","1")
      .attr("stroke-opacity","0.4");

var somePattern = defs.append("pattern")
    .attr("width",5)
    .attr("height",5)
    .attr("id","somePattern")
    .attr("patternUnits","userSpaceOnUse");

somePattern.append("circle")
    .attr('cx',2.5)
    .attr('cy',2.5)
    .attr('r',1)
    .attr('fill','black')
    .attr('fill-opacity',"0.4");

/*naPattern.append("image")
      .attr("x",0)
      .attr("y",0)
      .attr("width",10)
      .attr("height",10)
      .attr("xlink:href","anim_sp.gif");*/

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);
    //.on("click", clickZoom);

var g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  .append("g")
    .attr("id", "states")
    .classed("Greens",true);

var g2 = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  .append("g")
    .attr("id", "statesOverlay");

d3.json("states.json", function(json) {
  g.selectAll("path")
      .data(json.features)
    .enter().append("path")
      .attr("d", path)
      .attr("class",function(d){ console.log(d.id); 
          return ordinal(states_data[d.id]['public']);})
      //.attr("class",function(d){ return quantile(states_data[d.id]['money']);})
      .classed("focus",function(d) { if ($.inArray(d.properties.name,focused_states) > 0){
                                        return true;
                                     } else {
                                        return false;
                                     }})
      /*.on("mouseover",function(d) { if ($.inArray(d.properties.name,focused_states) > 0){
                                        console.log("moused over "+d.properties.name);
                                        d3.select(this).attr("fill","orange");
                                     } else {
                                        return false;
                                     }})*/
      .on("click", clickZoom); //unction(d) { if ($.inArray(d.properties.name,focused_states)>0) {
                          //               click(d)}})
      /*.on("mouseover",showTooltip)
      .on("mouseout",hideTooltip);*/

   g2.selectAll("path")
      .data(json.features)
    .enter().append("path")
      .attr("d",path)
      .classed("overlay",true)
      .attr("fill","none")
      /*.attr("fill",function(d) {    var public_status = states_data[d.id]['public'];
                                    if (public_status == 'Yes') {
                                       return 'none';
                                    } else if (public_status == 'No'){
                                       return 'url(#naPattern)';
                                    } else {
                                       return 'url(#somePattern)';
                                    }})*/
      .attr("stroke",function(d) { if ($.inArray(d.properties.name,focused_states) > 0){
                                        return "black";
                                     } else {
                                        return "none";
                                     }});

   g2.selectAll("text")
	.data(json.features)
	.enter()
	.append("svg:text")
        .classed("stateLabel",true)
	.text(function(d){return states_data[d.id]['abbr'];})
	.attr("x",function(d){return path.centroid(d)[0];})
	.attr("y",function(d){return path.centroid(d)[1];})
        .attr("dx","-0.5em")
        .attr("text_anchor","middle");
});

d3.selectAll(".focus").append('pattern').attr('xlink:href','somepattern.gif');


var default_caption = "<br/><p>At this time, Sunlight has not been able to gather information about the public availability of gun registration data in this state. If you have information you'd like to share, please contact us at email@sunlightfoundation.com</p>"

function clickZoom(d) {
  console.log(d);

  var x = 0,
      y = 0,
      k = 1;

 
  if (d && centered !== d) {
    hideTooltip(d);
    zoomed = true;
    var centroid = path.centroid(d);
    x = -centroid[0];
    y = -centroid[1] - 20;
    k = 4;
    centered = d;
    var caphtml = function () { 
        h = getStateDetails(d);
        if ($.inArray(d.properties.name,focused_states)>0) {
            h += states_info[d.properties.name]
        } else {
            h += default_caption
        }
        return h}
    $('#caption').html(caphtml);
    g2.style("visibility","hidden");
    d3.selectAll('.stateLabel').style("visibility","hidden");
    d3.selectAll('.stateLabel').style("font-size",".4em");
    setTimeout(function(){
      g2.style("visibility","visible");
      d3.selectAll('.stateLabel').style("visibility","visible");
    }, 1000);
  } else {
    zoomed = false;
    centered = null;
    $('#caption').html(intro_caption);
    if (d) {
        g2.style("visibility","hidden");
        d3.selectAll('.stateLabel').style("visibility","hidden");
    }
    d3.selectAll('.stateLabel').style("font-size",".7em");
    if (d) {
        setTimeout(function(){
            g2.style("visibility","visible");
            d3.selectAll('.stateLabel').style("visibility","visible");
        }, 1000);
    }
  }


  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(1000)
      .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
      .style("stroke-width", 1.5 / k + "px");
  
  g2.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g2.attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
      .style("stroke-width", 1.5 / k + "px");

}


function showTooltip(d) {
  //console.log(d);
  if (zoomed) {
      return true;
  } else {
      centroid = path.centroid(d);
      d3.select('#mapTooltip')
        .append('div')
        .style('position','absolute')
        .classed('tooltip',true)
        .classed('tophalf','true')
        .attr('id','hovertip')
        .html(getStateDetails(d))
        .style('margin-left',(centroid[0] + width/2 - 15)+'px')
        .style('margin-top',(centroid[1] + height/2 + 7)+'px');
  }
}



function hideTooltip(d) {
    d3.select('#hovertip').remove();
}

function getStateDetails(d) {
    var stateName = d.properties.name;
    var amountSpent = formatCurrency(states_data[d.id]['money']);
    var dataStatus = states_data[d.id]['public'];
    //var html_string = '<div class="stateDetail">';
    var html_string = '<h1>'+stateName+'</h1>';
    html_string += '<p><b>Contributions, 1990-pres:</b> '+amountSpent+'</p>';
    html_string += '<p><b>Publicly available data:</b> '+dataStatus+'</p>';
    //html_string += '</div>';
    return html_string;
}

function formatCurrency(num) {
  num = num.toString().replace(/\$|\,/g, '');
  if (isNaN(num)) num = "0";
  sign = (num == (num = Math.abs(num)));
  num = Math.floor(num * 100 + 0.50000000001);
  num = Math.floor(num / 100).toString();
  for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
    num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  return (((sign) ? '' : '-') + '$' + num );
}

