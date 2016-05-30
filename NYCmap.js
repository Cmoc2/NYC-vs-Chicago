//Set the SVG Element
var width = 600,
    height = 600;//600x600

//define color scale
var pop_colors = d3.scale.threshold().range(colorbrewer.Blues[7])
    .domain([40000, 80000, 120000, 160000, 200000, 220000]);
var life_colors = d3.scale.threshold().range(colorbrewer.Oranges[6])
    .domain([60, 70, 80, 90, 100]);
var income_colors = d3.scale.threshold().range(colorbrewer.Greens[6]);
    income_colors.domain([5000, 15000, 40000, 80000, 100000]);
var crime_colors = d3.scale.threshold().range(colorbrewer.Reds[8])
    .domain([0, 10, 20, 30, 40, 50, 60]);

//add for legend scale color reference
var pop = colorbrewer.Blues[7]; 
var life = colorbrewer.Oranges[6];
var income = colorbrewer.Greens[6];
var crime = colorbrewer.Reds[8];

//add for legend scale text reference
var popText = [40000, 80000, 120000, 160000, 200000, 220000];
var lifeText = [60, 70, 80, 90, 100];
var incomeText = [5000, 15000, 40000, 80000, 100000];
var crimeText = [0, 10, 20, 30, 40, 50, 60];

//Detailed Tooltip Selections
var tipDetail = {population:1, lifeExpectancy:2,income:3,crime:4},
    select;

//an SVG for New York
var svg = d3.select("body")
    .attr("align","center")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//space for tooltip
    var tooltip = d3.select("body")
	.append("div")
    .attr("class","tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
    .style("opacity",0)
	.style("display", "none");

//Should a detailed tooltip be shown?
var DetailedTooltip=false;

var poplegend = svg.selectAll(".legend")
            .data(pop_colors.domain(), function(d) { return d; })
            .enter()
            .append("g")
            .attr("class", "poplegend");

//the appending of the legend by color
    poplegend.append("rect")
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-45)
        .attr("width", 150)
        .attr("height", 15)
        .attr("fill", function(d, i){ return pop[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "3px")
        .style("opacity",1);

    poplegend.append("text")
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-15)
        .attr("width", 200)
        .attr("height", 15)
        .style("fill", "black")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 10)
        .text(function(d, i) { return popText[i];});

var crimelegend = svg.selectAll(".legend")
            .data(crime_colors.domain(), function(d) { return d; })
            .enter()
            .append("g")
            .attr("class", "crimelegend");

//the appending of the legend by color
 crimelegend.append("rect")
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-60)
        .attr("width", 200)
        .attr("height", 30)
        .attr("fill", function(d, i){ return crime[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "3px")
        .style("opacity",0);

var lifelegend = svg.selectAll(".legend")
            .data(life_colors.domain(), function(d) { return d; })
            .enter()
            .append("g")
            .attr("class", "lifelegend");

//the appending of the legend by color
 lifelegend.append("rect")
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-60)
        .attr("width", 200)
        .attr("height", 40)
        .attr("fill", function(d, i){ return life[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "3px")
        .style("opacity",0);

var incomelegend = svg.selectAll(".legend")
            .data(income_colors.domain(), function(d) { return d; })
            .enter()
            .append("g")
            .attr("class", "incomelegend");

//the appending of the legend by color
 incomelegend.append("rect")
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-60)
        .attr("width", 200)
        .attr("height", 30)
        .attr("fill", function(d, i){ return income[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "3px")
        .style("opacity",0);

//To make NY data Global
var NYdatum;

d3.json("NYData.json", function(error, json) {
    if (error) return console.error(error);
    
    var features = topojson.feature(json,json.objects.features);
    
    //copy to global variable
    NYdatum = features;
    
    //data Ranges
    var popRange=minMax("population", json);
    
    var projection = d3.geo.mercator()
  					.center([-73.94, 40.70])
  					.scale(54000)
  					.translate([(width) / 2, (height)/2]);
    
    var path = d3.geo.path().projection(projection);
    /*What does this do?
    svg.append("path")
        .datum(features)
        .attr("d", path);
    */
    
    //necessary to pass the District number to various .on()
    var districtNum;
    //color the Areas
    svg.selectAll(".features")
    .data(topojson.feature(json, json.objects.features).features)
  .enter().append("path")
    .attr("class", "NYfeatures")
    .attr("d", path)
    .on("mouseover", function(d){
        //fit the tooltip to the information shown
        tooltip.style("height","95px").style("width","175px");
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        //change the details inside the tooltip
        //NY-remove the hundreth digit from the Districts.
        function bDistrict(){
            var ManString=["Manhattan",100],BronxString=["Bronx",200],BrookString=["Brooklyn",300],qString=["Queens",400],StateString=["Staten Island",500],DistrictNum;
            switch(d.properties.boro_name){
                case ManString[0]:
                    DistrictNum=d.properties.boro_cd-ManString[1];
                    break;
                case BronxString[0]:
                    DistrictNum=d.properties.boro_cd-BronxString[1];
                    break;
                case BrookString[0]:
                    DistrictNum=d.properties.boro_cd-BrookString[1];
                    break;
                case qString[0]:
                    DistrictNum=d.properties.boro_cd-qString[1];
                    break;
                case StateString[0]:
                    DistrictNum=d.properties.boro_cd-StateString[1];
                    break;
                default:
                    DistrictNum="bearsNstuff";
            }
            districtNum = DistrictNum;
            return DistrictNum;
        }
        //skip the rest if theres no data to show
        if(bDistrict()=="bearsNstuff"){
            tooltip.style("height","15px").style("width","115px");
            tooltip.html("Unpopulated Area");
        } else
        //if showing general information:
        if(!DetailedTooltip) {
            tooltip.html(
                "<center><b>"+d.properties.boro_name+" District "
                + bDistrict()
                +"</b></center><br/>"
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
            tooltip.html(
                "<center><b>"+d.properties.boro_name+" District "
                + districtNum
                +"</b></center><br/>"
                +"Population: "+d.properties.population+"<br/>"
                +"Life Expectancy: "+d.properties.lifeExpectancy+"<br/>"
                +"Income per Capita: "+d.properties.income+"<br/>"
                +"Crime: "+d.properties.crimePerK);
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
    })
    //New York City Label
    svg.append("text")
    .attr("x",40)
    .attr("y",100)
    .attr("id","nyLabel")
    .text("New York City");
});


//SVG for Chicago
var svg2= d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

///Chicago Map with data
d3.json("ChicagoData.json", function(error, json) {
    if (error) return console.error(error);
   
    //data Ranges: Population,LifeExpectancy,CrimePerK,income
    var popRange=minMax("population",json);//2916,98514
    var lifeRange=minMax("lifeExpectancy",json);
    var crimeRange=minMax("crimePerK",json);//0.27,51.33
    var incomeRange=minMax("incomePerCapita",json);//8201,88669
    
     //location of geometries/properties
    var features = topojson.feature(json,json.objects.features);
    
    //copy features to global
    Cdatum = features;
    
    //allows view of the map (Otherwise it'll be drawn off-screen)
    var projection = d3.geo.albers()
                    .center([8.25, 41.88205])
                    .parallels([40, 45])
                    .scale(90000)
                    .rotate([92.35, .5, -4])
                    .translate([width / 2, height / 2]);
    var path = d3.geo.path().projection(projection);
    //what does this do?
    /*svg2.append("path")
        .datum(features)
        .attr("d", path);
    */
    //color the Areas
    svg2.selectAll(".features")
    .data(topojson.feature(json, json.objects.features).features)
  .enter().append("path")
    .attr("class", "Cfeatures")
    .attr("d", path)
    .on("mouseover", function(d){
        tooltip.style("height","100px").style("width","175px");
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        //change what's inside the tooltip
        if(!DetailedTooltip){
        tooltip.html("<center><b>"+d.properties.comName+"</b></center><br/>"
                    +"Population: "+d.properties.population+"<br/>"
                    +"Life Expectancy: "+d.properties.lifeExpectancy+"<br/>"
                    +"Income Per Capita: "+d.properties.incomePerCapita+"<br/>"
                    +"Crime: "+d.properties.crimePerK+"<br/>"
                    );
        } else tooltip.html("Detailed Info");
        //tooltip is initially hidden, so it won't show a weird space at the bottom of html.
        //tooltip activates the moment the mouse first goes over the map.
        return tooltip.style("display","inline");
    })
    .on("click", function(d){
        DetailedTooltip=!DetailedTooltip; //toggle.
        if(!DetailedTooltip) {
            tooltip.html("<center><b>"+d.properties.comName+"</b></center><br/>"
                        +"Population: "+d.properties.population+"<br/>"
                        +"Life Expectancy: "+d.properties.lifeExpectancy+"<br/>"
                        +"Income Per Capita: "+d.properties.incomePerCapita+"<br/>"
                        +"Crime: "+d.properties.crimePerK+"<br/>"
                        );
        } else tooltip.html("Detailed Info");
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
    //Chicago Label
    svg2.append("text")
    .attr("x",100)
    .attr("y",300)
    .attr("id","chicagoLabel")
    .text("Chicago");
});

//Draw the buttons
document.write('<br><div align="left"><button id="Population" class="PopButton" onclick="Population();">Population</button>');
document.write('<button id="lifeExpectancy" class="LifeButton" onclick="Life();">Life Expectancy</button>');
document.write('<button id="income" class="IncomeButton" onclick="Income();">Income</button>');
document.write('<button id="Crime" class="CrimeButton" onclick="Crime();">Crime</button><br/></div>');

//functions
function Population() {
    ColorScheme(NYdatum,svg,pop_colors,"population");
    ColorScheme(Cdatum,svg2,pop_colors,"population");  
    
    poplegend.transition(1000)
        .style("opacity",1);
    crimelegend.transition(1000)
        .style("opacity",0);
    incomelegend.transition(1000)
        .style("opacity",0);
    lifelegend.transition(1000)
        .style("opacity",0);
}
function Life() {
    ColorScheme(NYdatum,svg,life_colors,"lifeExpectancy");
    ColorScheme(Cdatum,svg2,life_colors,"lifeExpectancy");
    
    poplegend.style("opacity",0);
    crimelegend.style("opacity",0);
    incomelegend.style("opacity",0);
    lifelegend.transition(1000)
    .style("opacity",1);
    lifelegend.append("rect")
       .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-45)
        .attr("width", 150)
        .attr("height", 15)
        .attr("fill", function(d, i){ return life[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "3px");
    lifelegend.append("text")
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-15)
        .attr("width", 150)
        .attr("height", 15)
        .style("fill", "rgba(65, 65, 65, 0.86)")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 12.5)
        .text(function(d, i) { return lifeText[i];});
}
function Income() {
    ColorScheme(NYdatum,svg,income_colors,"income");
    ColorScheme(Cdatum,svg2,income_colors,"incomePerCapita"); 
    poplegend.transition(1000)
        .style("opacity",0);
    crimelegend.style("opacity",0);
    incomelegend.transition(1000)
    .style("opacity",1);
    lifelegend.style("opacity",0);
    incomelegend.append("rect")
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-45)
        .attr("width", 150)
        .attr("height", 15)
        .attr("fill", function(d, i){ return income[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "3px");
    incomelegend.append("text")
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-15)
        .attr("width", 150)
        .attr("height", 15)
        .style("fill", "rgba(65, 65, 65, 0.86)")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 11.5)
        .text(function(d, i) { return incomeText[i];});
}
function Crime() {
    ColorScheme(NYdatum,svg,crime_colors,"crimePerK");
    ColorScheme(Cdatum,svg2,crime_colors,"crimePerK");  
    poplegend.style("opacity",0);
    crimelegend.style("opacity",1);
    incomelegend.style("opacity",0);
    lifelegend.style("opacity",0);
    crimelegend.append("rect")
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-45)
        .attr("width", 150)
        .attr("height", 15)
        .attr("fill", function(d, i){ return crime[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "3px");
    crimelegend.append("text")
        .attr("x", function(d,i){ return 220 + (35 * i);})
        .attr("y", height-15)
        .attr("width", 150)
        .attr("height", 15)
        .style("fill", "rgba(65, 65, 65, 0.86)")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 12.5)
        .text(function(d, i) { return crimeText[i];});
}

//Helper Functions
//returns a [min,max] array of argument. Target is in json Properties.
function minMax(toGet,d){
        data = d.objects.features.geometries;
    return [d3.min(data, function(i){return i.properties[toGet];}),d3.max(data, function(i){return i.properties[toGet];})];
}

//draws colors for the buttons
function ColorScheme(data,map,color,property){
    map.selectAll("path")
    .data(data.features)
    .transition().duration(1000)
    .style("fill",
      function(d) {
      if (d.properties[property]) return color(d.properties[property]);
      else return "grey"});  
}