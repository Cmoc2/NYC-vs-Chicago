//Set the SVG Element
var width = 768,
    height = 600;//800x600

//SVG for Chicago
var svg2= d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//Should detailedtooltip be shown?
var DetailedTooltip=false;

///Chicago Map with data
d3.json("ChicagoData.json", function(error, json) {
    if (error) return console.error(error);
   
    //data Ranges: Population,LifeExpectancy,CrimePerK
    var popRange=minMax("population");
    var lifeRange=minMax("lifeExpectancy");
    var crimeRange=minMax("crimePerThousand");
   //Testing
    console.log(json.objects.features.geometries);
   //End Testing 
    //location of geometries/properties
    var features = topojson.feature(json,json.objects.features);
    //allows view of the map (Otherwise it'll be drawn off-screen)
    var projection = d3.geo.albers()
                    .center([8.25, 41.88205])
                    .parallels([40, 45])
                    .scale(90000)
                    .rotate([92.35, .5, -4])
                    .translate([width / 2, height / 2]);
    var path = d3.geo.path().projection(projection);
    //what does this do?
    svg2.append("path")
        .datum(features)
        .attr("d", path);
    
    //space for tooltip
    var tooltip = d3.select("body")
	.append("div")
    .attr("class","tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
    .style("opacity",0)
	.style("display", "none");
    ////
    //color the Areas
    svg2.selectAll(".features")
    .data(topojson.feature(json, json.objects.features).features)
  .enter().append("path")
    .attr("class", "Cfeatures")
    .attr("d", path)
    .on("mouseover", function(d){
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        //change what's inside the tooltip
        tooltip.html("Community Area: "+ d.id+"<br/>"
                    +"Population: "+d.properties.population+"<br/>"+
                     "Life Expectancy: "+d.properties.lifeExpectancy+"<br/>"+
                     "Income Per Capita: "+d.properties.incomePerCapita+"<br/>"
                    +"Crime: "+d.properties.crimePerK);
        //tooltip is initially hidden, so it won't show a weird space at the bottom of html.
        //tooltip activates the moment the mouse first goes over the map.
        return tooltip.style("display","inline");
    })
    .on("mousemove", function(d){
        //update tooltip position
        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function(d){
        //fade tooltip over .5s
        tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
    
    //helper functions
    //returns a [min,max] array of argument. Target is in json Properties.
    function minMax(toGet){
        data = json.objects.features.geometries;
    return [d3.min(data, function(i){return i.properties[toGet];}),d3.max(data, function(i){return i.properties[toGet];})];
}
});
//an SVG for New York
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("NYData.json", function(error, json) {
    if (error) return console.error(error);
    console.log(json.objects.features.geometries);
    
    var features = topojson.feature(json,json.objects.features);
    var projection = d3.geo.mercator()
  					.center([-73.94, 40.70])
  					.scale(60000)
  					.translate([(width) / 2, (height)/2]);
    
    var path = d3.geo.path().projection(projection);
    svg.append("path")
        .datum(features)
        .attr("d", path);
    
    //space for tooltip
    var tooltip = d3.select("body")
	.append("div")
    .attr("class","tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
    .style("opacity",0)
	.style("display", "none");
    
    //color the Areas
    svg.selectAll(".features")
    .data(topojson.feature(json, json.objects.features).features)
  .enter().append("path")
    .attr("class", "NYfeatures")
    .attr("d", path)
    .on("mouseover", function(d){
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        //change the details inside the tooltip
        //if showing general information:
        if(!DetailedTooltip) {
            tooltip.html("Borough: "+d.properties.boro_name+"<br/>"+ "Community District: "+ d.id+"<br/>"
                    +"Population: "+d.properties.population+"<br/>"
                    +"Life Expectancy: "+d.properties.lifeExpectancy+"<br/>"
                    +"Income per Capita: "+d.properties.income+"<br/>"
                    +"Crime: "+d.properties.crimePerK);
        } else //else show details on topic.
            tooltip.html("Detailed Info");
        return tooltip.style("display","inline");
    })
    .on("click", function(d){
        DetailedTooltip=!DetailedTooltip; //toggle.
        if(!DetailedTooltip) {
            tooltip.html("Borough: "+d.properties.boro_name+"<br/>"+ "Community District: "+ d.id+"<br/>"
                    +"Population: "+d.properties.population);
        } else tooltip.html("Detailed Info");
    })
    .on("mousemove", function(d){
        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function(d){
        tooltip.transition()
        .duration(500)
        .style("opacity", 0);
       //return tooltip.style("visibility","hidden");
    });
});
//Draw the buttons
document.write('<button id="Population" class="PopButton" onclick="Population();">Population</button>');
document.write('<button id="Crime" class="CrimeButton" onclick="Crime();">Crime</button>');
document.write('<button id="fifeExpectancy" class="LifeButton" onclick="Life();">Life Expectancy</button>');
