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
var select_colors;
//add for legend scale color reference
var pop = colorbrewer.Blues[7]; 
var life = colorbrewer.Oranges[6];
var income = colorbrewer.Greens[6];
var crime = colorbrewer.Reds[8];

//add for legend scale text reference
var popText = ["0-40K", "40K-80K", "80K-120K", "120K-160K","160K-200K","200K+"];
var lifeText = ["0-60", "60-70", "70-80", "80-90", "90-100"];
var incomeText = ["$0-$5000", "$5000-15k", "$15k-$40k", "$40k-$80k", "$80k-$100k"];
var crimeText = [0, 10, 20, 30, 40, 50, 60];

//Detailed Tooltip Selections
var tipDetail = {population:"population", lifeExpectancy:"lifeExpectancy",income:"incomePerCapita",crime:"crimePerK"},select;

//an SVG to append both svg's
var parentSVG= d3.select("body")
    .attr("align","center")
    .append("svg")
    .attr("id","parentSVG")
    .attr("align","center")
    .attr("width", width*2)
    .attr("height", height);
//an SVG for New York
var svg = d3.select("#parentSVG")
    .append("svg")
    .attr("align","center")
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

var popRange, lifeRange, incomeRange, crimeRange;

//To make NY data Global
var NYdatum;

d3.json("NYData.json", function(error, json) {
    if (error) return console.error(error);
    
    var features = topojson.feature(json,json.objects.features);
    
    //copy to global variable
    NYdatum = features;
    
    //data Ranges
    popRange=minMax("population", json);//51673,247354
    lifeRange=minMax("lifeExpectancy", json);//74,85
    incomeRange=minMax("incomePerCapita", json);//11042,99858
    crimeRange=minMax("crimePerK",json);//3.75,98.63
    
    var projection = d3.geo.mercator()
  					.center([-73.94, 40.70])
  					.scale(54000)
  					.translate([(width/2)+30, (height)/2]);
    
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
                TooltipTextNY(d,"boro_name","population","lifeExpectancy","incomePerCapita","crimePerK");
            } else{//d3.select(this).style("fill","yellow"); //else show details on topic.
                tooltip.html(
                        "<center><b>"+d.properties.boro_name+" District "
                        + bDistrict(d)
                        +"</b></center><br/>"
                        +"Detailed Info");
            }
            //tooltip is initially hidden, activates when mouse first goes over map.
            return tooltip.style("display","inline");
        })
        .on("click", function(d){
            if(bDistrict(d)=="bearsNstuff");else{
                DetailedTooltip=!DetailedTooltip; //toggle.
                if(!DetailedTooltip) {
                    TooltipTextNY(d,"boro_name","population","lifeExpectancy","incomePerCapita","crimePerK");
                } else{ //d3.select(this).style("fill","yellow");
                       tooltip.html(
                        "<center><b>"+d.properties.boro_name+" District "
                        + bDistrict(d)
                        +"</b></center><br/>"
                        +"Detailed Info");
                }
            }
        })
        .on("mousemove", function(d){
            return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function(d){
            tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        })
        //New York City Label
    svg.append("text")
    .attr("x",70)
    .attr("y",100)
    .attr("id","nyLabel")
    .style("opacity",0)
    .text("New York City")
    .transition(2000)
    .delay(500)
    .style("opacity",1);
    
    function TooltipTextNY(d,name,pop,life,inc,crime){
        tooltip.html(
                        "<center><b>"+d.properties[name]+" District "
                        + bDistrict(d)
                        +"</b></center><br/>"
                        +"Population: "+d.properties[pop]+"<br/>"
                        +"Life Expectancy: "+d.properties[life]+"<br/>"
                        +"Income per Capita: "+d.properties[inc]+"<br/>"
                        +"Crime: "+d.properties[crime]);
    }
    //Gets the map coloring started @ Population
    select=tipDetail.population;
    select_colors=pop_colors;
    ColorScheme(NYdatum,svg,pop_colors,"population");  
    ShowLegendPLIC(1,0,0,0);
    UpdateSlider([2500,250000]);
});

//SVG for Chicago
var svg2= d3.select("#parentSVG")
    .append("svg")
    .attr("align","center")
    .attr("x",width)
    .attr("width", width)
    .attr("height", height);
//To make Chicago data global
var Cdatum;
///Chicago Map with data
d3.json("ChicagoData.json", function(error, json) {
    if (error) return console.error(error);
   
    //data Ranges: Population,LifeExpectancy,CrimePerK,income
    popRange=minMax("population",json);//2916,98514
    lifeRange=minMax("lifeExpectancy",json);//68.8,85.2
    crimeRange=minMax("crimePerK",json);//0.27,51.33
    incomeRange=minMax("incomePerCapita",json);//8201,88669
    
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
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        //change what's inside the tooltip
        if(!DetailedTooltip){
            tooltip.style("height","100px").style("width","175px");
            TooltipTextC(d,"comName","population","lifeExpectancy","incomePerCapita","crimePerK");
        } else {
            switch(select){
                case tipDetail.population:
                    tooltip.style("height", "118px").style("width", "180px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Population: " + d.properties.population + "<br/>" + "Crowded Housing: " + d.properties.percentcrowdedhousing + "<br/>" + "Age 25+ and no HS Diploma: " + d.properties.percent25plusnoHSD + "<br/>" + "Teen Birth Rate: " + d.properties.teenBirthRate );
                    break;
                case tipDetail.lifeExpectancy:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Life Expectancy: " + d.properties.lifeExpectancy + "<br/>" + "Hardship Index: " + d.properties.hardshipIndex + "<br/>" + "Elevated blood lead levels in children ages 0-6: " + d.properties.pElevatedBlood0_6 + "<br/>" + "Birth Rate: " + d.properties.birthRate);
                    break;
                case tipDetail.income:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Income Per Capita: " + d.properties.incomePerCapita + "<br/>" + "Percent Below Poverty: " + d.properties.percentbelowpoverty + "<br/>" + "16+ Unemployed: " + d.properties.percent16plusunemployed + "<br/>" + "Dependents: " + d.properties.dependents);
                    break;
                case tipDetail.crime:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Crime Per K: " + d.properties.crimePerK + "<br/>" + "Violent Crimes: " + d.properties.violentCrimes + "<br/>" + "Homicide Assaults: " + d.properties.homocideAssault + "<br/>" + "Fire-Arm Related Crimes: " + d.properties.firearmRelated);
                    break;
            }
        }
        //tooltip activates the moment the mouse first goes over the map.
        return tooltip.style("display","inline");
    })
    .on("click", function(d){
        console.log(d);
        DetailedTooltip=!DetailedTooltip; //toggle.
        if(!DetailedTooltip) {
            tooltip.style("height","100px").style("width","175px");
            TooltipTextC(d,"comName","population","lifeExpectancy","incomePerCapita","crimePerK");
        } else{
            switch(select){
                case tipDetail.population:
                    tooltip.style("height", "118px").style("width", "180px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Population: " + d.properties.population + "<br/>" + "Crowded Housing: " + d.properties.percentcrowdedhousing + "<br/>" + "Age 25+ and no HS Diploma: " + d.properties.percent25plusnoHSD + "<br/>" + "Teen Birth Rate: " + d.properties.teenBirthRate );
                    break;
                case tipDetail.lifeExpectancy:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Life Expectancy: " + d.properties.lifeExpectancy + "<br/>" + "Hardship Index: " + d.properties.hardshipIndex + "<br/>" + "Elevated blood lead levels in children ages 0-6: " + d.properties.pElevatedBlood0_6 + "<br/>" + "Birth Rate: " + d.properties.birthRate);
                    break;
                case tipDetail.income:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Income Per Capita: " + d.properties.incomePerCapita + "<br/>" + "Percent Below Poverty: " + d.properties.percentbelowpoverty + "<br/>" + "16+ Unemployed: " + d.properties.percent16plusunemployed + "<br/>" + "Dependents: " + d.properties.dependents);
                    break;
                case tipDetail.crime:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Crime Per K: " + d.properties.crimePerK + "<br/>" + "Violent Crimes: " + d.properties.violentCrimes + "<br/>" + "Homicide Assaults: " + d.properties.homocideAssault + "<br/>" + "Fire-Arm Related Crimes: " + d.properties.firearmRelated);
                    break;
            }
        }
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
    
    //initial shading of the map.
    ColorScheme(Cdatum,svg2,pop_colors,"population");
});
//Draw the buttons & set slider div
document.write('<br><div align="center" id="buttonOptions"><button id="Population" class="PopButton" onclick="Population();">Population</button> ');
document.write('<button id="lifeExpectancy" class="LifeButton" onclick="Life();">Life Expectancy</button> ');
document.write('<button id="income" class="IncomeButton" onclick="Income();">Income</button> ');
document.write('<button id="Crime" class="CrimeButton" onclick="Crime();">Crime</button><div align="left" id="slider"></div>');
document.write('<div align="center" id="slider-left-value"></div><div id="slider-right-value"></div></div>');

//Slider var;create element;On slide, change colors.
var slider = document.getElementById('slider');
var sliderValues = [document.getElementById('slider-left-value'),document.getElementById('slider-right-value')]
noUiSlider.create(slider, {
    start: [0,0],
    tooltips:[false,false],
    behaviour: 'drag-tap',
	connect: true,
	range: {
	'min': 0,
	'max': 42
    }
});
sliderValues[0].innerHTML=slider.noUiSlider.get()[0];
sliderValues[1].innerHTML=slider.noUiSlider.get()[1];
slider.noUiSlider.on('slide', function(values,handle){
    sliderValues[handle].innerHTML=values[handle];
    Highlight(NYdatum,Cdatum,svg,svg2,select_colors,select,slider.noUiSlider.get());
});

//Gets the legend started. Hidden
AppendLegend(pop_colors,pop,popText,"poplegend",0);
AppendLegend(life_colors,life,lifeText,"lifelegend",0);
AppendLegend(income_colors,income,incomeText,"incomelegend",0);
AppendLegend(crime_colors,crime,crimeText,"crimelegend",0);

//button functions
function Population() {
    select=tipDetail.population;
    select_colors=pop_colors;
    ColorScheme(NYdatum,svg,pop_colors,"population");
    ColorScheme(Cdatum,svg2,pop_colors,"population");  
    ShowLegendPLIC(1,0,0,0);
    UpdateSlider([2500,250000]);
}
function Life() {
    select=tipDetail.lifeExpectancy;
    select_colors=life_colors;
    ColorScheme(NYdatum,svg,life_colors,"lifeExpectancy");
    ColorScheme(Cdatum,svg2,life_colors,"lifeExpectancy");
    ShowLegendPLIC(0,1,0,0);
    UpdateSlider(lifeRange);
}
function Income() {
    select=tipDetail.income;
    select_colors=income_colors;
    ColorScheme(NYdatum,svg,income_colors,"incomePerCapita");
    ColorScheme(Cdatum,svg2,income_colors,"incomePerCapita"); 
    ShowLegendPLIC(0,0,1,0);
    UpdateSlider(incomeRange);
}
function Crime() {
    select=tipDetail.crime;
    select_colors=crime_colors;
    ColorScheme(NYdatum,svg,crime_colors,"crimePerK");
    ColorScheme(Cdatum,svg2,crime_colors,"crimePerK");
    ShowLegendPLIC(0,0,0,1);
    UpdateSlider(crimeRange);
}

/*-----Helper Functions------*/

//returns a [min,max] array of argument. Target is in json Properties.
function minMax(toGet,d){
    var data = d.objects.features.geometries;
    return [d3.min(data, function(i){return i.properties[toGet];}),d3.max(data, function(i){return i.properties[toGet];})];
}

function UpdateSlider(rangeVals){
    slider.noUiSlider.updateOptions({
        range:{
            'min':(rangeVals[0]-2),
            'max':(rangeVals[1]+5)
        }
        
    });
    slider.noUiSlider.set([rangeVals[0]-1, rangeVals[0]-1]); 
    sliderValues[0].innerHTML=slider.noUiSlider.get()[0];
    sliderValues[1].innerHTML=slider.noUiSlider.get()[1];
    
}

function Highlight(NYdata,CData,NYmap,Cmap,color,property,setVals){
     NYmap.selectAll("path")
    .data(NYdata.features)
    .transition().duration(1000)
    .style("fill",
      function(d) {
      if (d.properties[property]){ 
          if(d.properties[property] >= setVals[0]  && d.properties[property] <= setVals[1])
            return "yellow";
          else return color(d.properties[property]);
      }
      else return "white"});
   ///////////////////////////// 
    Cmap.selectAll("path")
    .data(CData.features)
    .transition().duration(1000)
    .style("fill",
      function(d) {
      if (d.properties[property]){ 
          if(d.properties[property] >= setVals[0]  && d.properties[property] <= setVals[1])
            return "yellow";
          else return color(d.properties[property]);
      }
      else return "white"});
}

//draws colors for the buttons
function ColorScheme(data,map,color,property){
    map.selectAll("path")
    .data(data.features)
    .transition().duration(1000)
    .style("fill",
      function(d) {
      if (d.properties[property]) return color(d.properties[property]);
      else return "white"});  
}

function AppendLegend(cScale, brewSet, textArray,cssClass,opacity){
    var legendHeight=600;
    parentSVG.selectAll(".legend")
        .data(cScale.domain(),function(d){return d;})
        .enter()
        .append("g")
        .attr("class", cssClass)
        .attr("opacity",opacity)
        .append("rect")//55*i
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", 600)
        .attr("y", function(d,i){return height-175-(55*i)})
        .attr("width", 15)
        .attr("height", 55)
        .attr("fill", function(d, i){ return brewSet[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "2px")
        .style("opacity",1);
    //further appending will append it inside rect. Starting again appending to g.
    parentSVG.selectAll("g."+cssClass)
        .append("text")
        .attr("class", cssClass)
        .attr("x", function(d){ return 600+25})
        .attr("y", function(d,i){return height-140-(55*i)})
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
//NY-remove the hundredth digit from the Districts.
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
function TooltipTextC(d,name,pop,life,inc,crime){
    tooltip.html("<center><b>"+d.properties[name]+"</b></center><br/>"
                        +"Population: "+d.properties[pop]+"<br/>"
                        +"Life Expectancy: "+d.properties[life]+"<br/>"
                        +"Income Per Capita: "+d.properties[inc]+"<br/>"
                        +"Crime: "+d.properties[crime]+"<br/>"
                        );
}

function HoverHighlight(d,select){
    d3.select(d).style("fill",function(d){
            return select_colors(d.properties[select])});
}
