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
    var features = topojson.feature(json,json.objects.features);
    var projection = d3.geo.albers()
                    .center([8.25, 41.88205])
                    .parallels([40, 45])
                    .scale(90000)
                    .rotate([92.35, .5, -4])
                    .translate([width / 2, height / 2])
    var path = d3.geo.path().projection(projection);
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
	.style("display", "none")
	/*.text(function(d){
        return "Community Area: "+d.id;
    })*/
    ;
    ////
    //color the Areas
    svg2.selectAll(".features")
    .data(topojson.feature(json, json.objects.features).features)
  .enter().append("path")
    .attr("class", "Cfeatures")
    .attr("d", path)
    /*.append("svg:title")
    .text(function(d){
        return "Community Area:" + d.properties.comArea;
    });*/
    .on("mouseover", function(d){
        
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        //change what's inside the tooltip
        tooltip.html("Community Area: "+ d.id+"<br/>"
                    +"Population: "+d.properties.population+"<br/>"+
                     "Life Expectancy: "+d.properties.lifeExpectancy+"<br/>"+
                     "Income Per Capita: "+d.properties.incomePerCapita);
        return tooltip.style("display","inline");
    })
    .on("mousemove", function(d){
        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function(d){
        tooltip.transition()
        .duration(500)
        .style("opacity", 0);
       //return tooltip.style("visibility","hidden");
    })
    
    //helper functions
    //returns a [min,max] array of argument
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
	.style("display", "none")
	/*.text(function(d){
        return "Community Area: "+d.id;
    })*/
    ;
    //////
    
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
        //change what's inside the tooltip
        if(!DetailedTooltip) {
            tooltip.html("Borough: "+d.properties.boro_name+"<br/>"+ "Community District: "+ d.id+"<br/>"
                    +"Population: "+d.properties.population);
        } else tooltip.html("Detailed Info");
        return tooltip.style("display","inline");
    })
    .on("click", function(d){
        DetailedTooltip=!DetailedTooltip;
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
    //draw the boundaries
    
});
document.write('<button id="Population" class="PopButton" onclick="Population();">Population</button>');
document.write('<button id="Crime" class="CrimeButton" onclick="Crime();">Crime</button>');
document.write('<button id="fifeExpectancy" class="LifeButton" onclick="Life();">Life Expectancy</button>');