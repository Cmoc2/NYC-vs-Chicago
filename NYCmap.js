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
var popText = ["40000+", 80000, 120000, 160000, 200000, 220000];
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
            return DistrictNum;
        }
        //skip the rest if theres no data to show
        if(bDistrict()=="bearsNstuff"){
            tooltip.style("height","15px").style("width","115px");
            tooltip.html("Unpopulated Area");
        } else
        //if showing general information:
        if(!DetailedTooltip) {
            tooltip.html("<center><b>"+d.properties.boro_name+" District "
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
            tooltip.html("Borough: "+d.properties.boro_name+"<br/>"+ "Community District: "+ d.id+"<br/>"
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

    //copy to global variable
    NYdatum = features;
    
    //data Ranges
    var popRange=minMax("population", json);
    
    var projection = d3.geo.mercator()
  					.center([-73.94, 40.70])
  					.scale(54000)
  					.translate([(width) / 2, (height)/2]);
    
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
            //skip the rest if theres no data to show
            if(bDistrict(d)=="bearsNstuff"){
                tooltip.style("height","15px").style("width","115px");
                tooltip.html("Unpopulated Area");
            } else
            //if showing general information:
            if(!DetailedTooltip) {
                tooltip.html(
                    "<center><b>"+d.properties.boro_name+" District "
                    + bDistrict(d)
                    +"</b></center><br/>"
                    +"Population: "+d.properties.population+"<br/>"
                    +"Life Expectancy: "+d.properties.lifeExpectancy+"<br/>"
                    +"Income per Capita: "+d.properties.income+"<br/>"
                    +"Crime: "+d.properties.crimePerK);
            } else //else show details on topic.
                tooltip.html(
                        "<center><b>"+d.properties.boro_name+" District "
                        + bDistrict(d)
                        +"</b></center><br/>"
                        +"Detailed Info");

            return tooltip.style("display","inline");
        })
        .on("click", function(d){
            if(bDistrict(d)=="bearsNstuff");else{
                DetailedTooltip=!DetailedTooltip; //toggle.
                if(!DetailedTooltip) {
                    tooltip.html(
                        "<center><b>"+d.properties.boro_name+" District "
                        + bDistrict(d)
                        +"</b></center><br/>"
                        +"Population: "+d.properties.population+"<br/>"
                        +"Life Expectancy: "+d.properties.lifeExpectancy+"<br/>"
                        +"Income per Capita: "+d.properties.income+"<br/>"
                        +"Crime: "+d.properties.crimePerK);
                } else tooltip.html(
                        "<center><b>"+d.properties.boro_name+" District "
                        + bDistrict(d)
                        +"</b></center><br/>"
                        +"Detailed Info");
            }
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
    .style("opacity",0)
    .text("New York City")
    .transition(2000)
    .delay(500)
    .style("opacity",1);
    
    //Helper functions (Only for NY)
    //NY-remove the hundreth digit from the Districts.
    function bDistrict(d){
                var ManString=["Manhattan",100],BronxString=["Bronx",200],BrookString=["Brooklyn",300],qString=["Queens",400],StateString=["Staten Island",500];
                switch(d.properties.boro_name){
                    case ManString[0]:
                        return d.properties.boro_cd-ManString[1];
                        break;
                    case BronxString[0]:
                        return d.properties.boro_cd-BronxString[1];
                        break;
                    case BrookString[0]:
                        return d.properties.boro_cd-BrookString[1];
                        break;
                    case qString[0]:
                        return d.properties.boro_cd-qString[1];
                        break;
                    case StateString[0]:
                        return d.properties.boro_cd-StateString[1];
                        break;
                    default:
                        return "bearsNstuff";
                }
            }
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
        } else tooltip.html(
                    "<center><b>"+d.properties.comName+"</b></center><br/>"
                    +"Detailed Info");
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
        } else tooltip.html(
                    "<center><b>"+d.properties.comName+"</b></center><br/>"
                    +"Detailed Info");
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
    .style("opacity",0)
    .text("Chicago")
    .transition(2000)
    .delay(500)
    .style("opacity",1);
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
    ShowLegendPLIC(1,0,0,0);
}
function Life() {
    ColorScheme(NYdatum,svg,life_colors,"lifeExpectancy");
    ColorScheme(Cdatum,svg2,life_colors,"lifeExpectancy");
    ShowLegendPLIC(0,1,0,0);
}
function Income() {
    ColorScheme(NYdatum,svg,income_colors,"income");
    ColorScheme(Cdatum,svg2,income_colors,"incomePerCapita");
    ShowLegendPLIC(0,0,1,0);
}
function Crime() {
    ColorScheme(NYdatum,svg,crime_colors,"crimePerK");
    ColorScheme(Cdatum,svg2,crime_colors,"crimePerK");  
    ShowLegendPLIC(0,0,1,0);
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

AppendLegend(pop_colors,pop,popText,"poplegend",0);
AppendLegend(life_colors,life,lifeText,"lifelegend",0);
AppendLegend(income_colors,income,incomeText,"incomelegend",0);
AppendLegend(crime_colors,crime,crimeText,"crimelegend",0);

function AppendLegend(cScale, brewSet, textArray,cssClass,opacity){
    svg.selectAll(".legend")
        .data(cScale.domain(),function(d){return d;})
        .enter()
        .append("g")
        .attr("class", cssClass)
        .attr("opacity",opacity)
        .append("rect")
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", function(d,i){ return 220 + (55 * i);})
        .attr("y", height-40)
        .attr("width", 55)
        .attr("height", 15)
        .attr("fill", function(d, i){ return brewSet[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "2px")
        .style("opacity",1);
    //further appending will append it inside rect. Starting again appending to g.
    svg.selectAll("g."+cssClass)
        .append("text")
        .attr("class", cssClass)
        .attr("x", function(d,i){ return 225 + (55 * i);})
        .attr("y", height-15)
        .attr("width", 200)
        .attr("height", 15)
        .style("opacity",opacity)
        .style("fill", "black")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 10)
        .text(function(d, i) { return (textArray[i]);});
}

function ShowLegendPLIC(popOpac,lifeOpac,incomeOpac,crimeOpac){
    d3.selectAll(".poplegend")
        .transition(1000)
        .style("opacity",popOpac);
    d3.selectAll(".lifelegend")
        .transition(1000)
        .style("opacity",lifeOpac);
    d3.selectAll(".incomelegend")
        .transition(1000)
        .style("opacity",incomeOpac);
    d3.selectAll(".crimelegend")
        .transition(1000)
        .style("opacity",crimeOpac);
}