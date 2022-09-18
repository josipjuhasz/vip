const width = innerWidth;
const height = innerHeight;

var margin = {top: 10, right: 100, bottom: 30, left: 50},
    playerWidth = 600 - margin.left - margin.right,
    playerHeight = 480 - margin.top - margin.bottom;

// append the svg object to the body of the page
var playerSvg = d3.select("#playerStats")
  .append("svg")
    .attr("width", width)
    .attr("height", playerHeight + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
const svg = d3.select("#mapContainer").append("svg")
    .attr("class", "container")
    .attr("width", width)
    .attr("height", height * 0.75)

var topPlayersSvg = null

const projection = d3.geoNaturalEarth1()
    .scale(230)
    .translate([width / 3, height / 2.7]);

const pathGenerator = d3.geoPath().projection(projection);

var variable = "No data"
var chessPlayerIndex = 0

function removeAttributes(){
    svg.selectAll("image")
    .remove()

    svg.selectAll("text")
        .remove()
}

function createTopPlayersDiv(){
    topPlayersSvg = d3.select("#topPlayersDiv")
    .append("svg")
    .attr("class", "topPlayersSvg")
    .attr("width", width * 0.8)
    .attr("height", height * 0.5)
}

const g = svg.append("g")

g.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}))

function findPlayer(data, country){
    removeAttributes()
    for(var i = 0; i < data.length; i++){
        if(data[i]["country"] == country){
            variable = data[i]
            break;
        } 
    }
    if(variable != "No data"){
        svg.append("image")
            .attr('x', innerWidth * 0.7)
            .attr('y', 50)
            .attr('width', 200)
            .attr('height', 240)
            .attr("xlink:href", variable["picture"])

        svg.append("text")
        .attr('class', 'textIgraca')
        .text(function(){
            return "Name: " + variable["name"]
        })
        .attr("x", innerWidth * 0.82)
        .attr('y', 80)

        svg.append("text")
        .attr('class', 'textIgraca')
        .text(function(){
            return "Country: " + variable["country"]
        })
        .attr("x", innerWidth * 0.82)
        .attr('y', 110)

        svg.append("text")
        .attr('class', 'textIgraca')
        .text(function(){
            return "Rating: " + variable["rating"]
        })
        .attr("x", innerWidth * 0.82)
        .attr('y', 140)

        svg.append("text")
        .attr('class', 'textIgraca')
        .text(function(){
            return "Title: " + variable["title"]
        })
        .attr("x", innerWidth * 0.82)
        .attr('y', 170)
    } else {
        svg.append("text")
            .text("No available data.")
            .attr("x", innerWidth * 0.81)
            .attr('y', 70)
    }

    variable = "No data"
}


Promise.all([
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
    d3.tsv('110m.tsv'),
    d3.csv('data.csv'),
    d3.csv("playerRatings.csv"),
    d3.csv("playersInformation.csv")
]).then(([topoJSONdata, tsvData, chessCountryData, data, playersInformation]) => {
    const countryName = {}
    var chessPlayersDetails = {}
    tsvData.forEach(element => {
        countryName[element.iso_n3] = element.name;
    });
    chessCountryData.forEach(element => {
        
        chessPlayersDetails[chessPlayerIndex] = element["country"]
        chessPlayerIndex++
    })

    const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries)
    svg.selectAll('path').data(countries.features)
        .enter().append('path')
            .attr('class', 'country')
            .attr('d', pathGenerator)
            .on('click', function(d){
                findPlayer(chessCountryData, d.path[0].__data__.properties.name)
            })
        .append('title')
            .text(d => countryName[d.id])

    var allGroup = ["Magnus Carlsen", "Liren Ding", "Ian Nepomniachtchi", "Alireza Firouzja", "Fabiano Caruana", "Levon Aronian", "Wesley So"]
    var newGroup = ["Magnus Carlsen", "Liren Ding", "Ian Nepomniachtchi", "Alireza Firouzja", "Fabiano Caruana", "Levon Aronian", "Wesley So"]
    var topPlayers = ["----","Magnus Carlsen", "Liren Ding", "Ian Nepomniachtchi", "Alireza Firouzja", "Fabiano Caruana", "Levon Aronian", "Wesley So"]

    // add the options to the button
    d3.select("#selectButton1")
        .selectAll('myOptions')
            .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d.replace(/\s/g, '') }) // corresponding value returned by the button

    d3.select("#buttonTopPlayers")
        .selectAll('myOptions')
            .data(topPlayers)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d.replace(/\s/g, '') }) // corresponding value returned by the button

    d3.select("#selectButton2")
        .selectAll('myOptions')
            .data(newGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d.replace(/\s/g, '') }) // corresponding value returned by the button

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
        .domain([2012, 2022])
        .range([ 0, playerWidth]);
        playerSvg.append("g")
        .attr("transform", "translate(0," + playerHeight + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain( [1900,3000])
        .range([ playerHeight, 0 ]);
        playerSvg.append("g")
        .call(d3.axisLeft(y));

    // Initialize line with group a
    var line = playerSvg
        .append('g')
        .append("path")
        .datum(data)
        .attr("d", d3.line()
            .x(function(d) { return x(+d.year) })
            .y(function(d) { return y(+d.MagnusCarlsen) })
        )
        .attr("stroke", function(d){ return myColor("MagnusCarlsen") })
        .style("stroke-width", 4)
        .style("fill", "none")

    var newLine = playerSvg
        .append('g')
        .append("path")
        .datum(data)
        .attr("d", d3.line()
            .x(function(d) { return x(+d.year) })
            .y(function(d) { return y(+d.MagnusCarlsen) })
        )
        .attr("stroke", function(d){ return myColor("MagnusCarlsen") })
        .style("stroke-width", 4)
        .style("fill", "none")

    function showTopPlayer(selectedOption, playersInformation){
        var player

        for(var i = 0; i < playersInformation.length; i++){
            if(playersInformation[i]["id"] == selectedOption){
                player = playersInformation[i]
                break;
            } 
        }
        
        topPlayersSvg.selectAll("*")
            .remove()
            
        if (selectedOption != "None"){
            
            topPlayers.shift()

        topPlayersSvg.append("image")
            .attr('width', 200)
            .attr('height', 240)
            .attr("xlink:href", player["playerPicture"])
    
        topPlayersSvg.append("image")
                .attr('x', innerWidth * 0.14)
                .attr('y', 10)
                .attr('width', 50)
                .attr('height', 50)
                .attr("xlink:href", player["flag"])

        

        topPlayersSvg.append("text")
            .attr('class', 'textIgraca')
            .text(function(){
                return "Name: " + player["name"]
            })
            .attr("x", innerWidth * 0.14)
            .attr('y', 110)

        topPlayersSvg.append("text")
            .attr('class', 'textIgraca')
            .text(function(){
                return "FIDE rank: " + player["fideRank"]
            })
            .attr("x", innerWidth * 0.14)
            .attr('y', 140)

        topPlayersSvg.append("text")
            .attr('class', 'textIgraca')
            .text(function(){
                return "Highest rating: " + player["highestRating"]
            })
            .attr("x", innerWidth * 0.14)
            .attr('y', 170)

        topPlayersSvg.append("text")
            .attr('class', 'textIgraca')
            .text(function(){
                return "Current rating: " + player["currentRating"]
            })
            .attr("x", innerWidth * 0.14)
            .attr('y', 200)

        topPlayersSvg.append("text")
            .attr('class', 'textIgraca')
            .attr("x", innerWidth * 0.3)
            .attr('y', 50)
            .text(function(){
                return player["description"]
            })
            .call(wrap, 250)
            

        createPieChart(player)
        }
    }

    // A function that update the chart
    function update(selectedGroup) {

        // Create new data with the selection?
        var dataFilter = data.map(function(d){
            return {year: d.year, value:d[selectedGroup]} })
        // Give these new data to update line

        line
            .datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
            .x(function(d) { return x(+d.year) })
            .y(function(d) { return y(+d.value) })
            )
            .attr("stroke", function(d){ 
                return myColor(selectedGroup) })

        newLine
            .datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
            .x(function(d) { return x(+d.year) })
            .y(function(d) { return y(+d.value) })
            )
            .attr("stroke", function(d){ return d3.schemeSet3 })


        
        playerSvg.selectAll("text")
            .data(dataFilter)
            .enter()
            .append("text")
            .text(function(d){
                console.log(d)
                return d.value})
            .attr("d", d3.line()
                .x(function(d) { return x(+d.year) })
                .y(function(d) { return y(+d.value) })
            )
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton1").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })

    d3.select("#buttonTopPlayers").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        if (topPlayersSvg == null){
            createTopPlayersDiv()
        }
        showTopPlayer(selectedOption, playersInformation)
    })
})



function createPieChart(player){
    const whiteData = [player["whiteWin"],player["whiteDraw"],player["whiteLose"]];
    const blackData = [player["blackWin"],player["blackDraw"],player["blackLose"]];

    topPlayersSvg.append("text")
        .attr('class', 'textIgraca')
        .text("With white pieces")
        .attr("x", width * 0.53)
        .attr('y', 10)
  
    let g = topPlayersSvg.append("g")
               .attr("transform", "translate(" + width * 0.58 + ", "+ height * 0.15 + ")")
          
        // Creating Pie generator
        var pie = d3.pie();
  
        // Creating arc
        var arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(100);
  
        // Grouping different arcs
        var arcs = g.selectAll("arc")
                    .data(pie(whiteData))
                    .enter()
                    .append("g");
  
        // Appending path 
        arcs.append("path")
            .attr("fill", (data, i)=>{
                let value=data.data;
                return d3.schemeSet3[i + 2];
            })
            .attr("d", arc);

             // Adding data to each arc
        arcs.append("text")
        .attr("transform",(d)=>{ 
                return "translate("+ 
                arc.centroid(d) + ")"; 
        })
        .text(function(d){
           return d.data; 
           });


        /*black pieces */

        topPlayersSvg.append("text")
        .attr('class', 'textIgraca')
        .text("With black pieces")
        .attr("x", width * 0.69)
        .attr('y', 10)
  
        let blackGg = topPlayersSvg.append("g")
               .attr("transform", "translate(" + width * 0.73 + ", "+ height * 0.15 + ")")
          
        // Creating Pie generator
        var pie = d3.pie();
  
        // Creating arc
        var arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(100);
  
        // Grouping different arcs
        var arcs = blackGg.selectAll("arc")
                    .data(pie(blackData))
                    .enter()
                    .append("g");
  
        // Appending path 
        arcs.append("path")
            .attr("fill", (data, i)=>{
                let value=data.data;
                return d3.schemeSet3[i + 2];
            })
            .attr("d", arc);

             // Adding data to each arc
        arcs.append("text")
        .attr("transform",(d)=>{ 
                return "translate("+ 
                arc.centroid(d) + ")"; 
        })
        .text(function(d){
           return d.data; 
           });

        topPlayersSvg.append("text")
            .attr("x", width * 0.65)             
            .attr("y", height * 0.3)
            .attr("text-anchor", "middle")  
            .style('fill', d3.schemeSet3[2])
            .text("Win");

        topPlayersSvg.append("text")
            .attr("x", width * 0.65)             
            .attr("y", height * 0.33)
            .attr("text-anchor", "middle")  
            .style('fill', d3.schemeSet3[3])
            .text("Draw");

        topPlayersSvg.append("text")
            .attr("x", width * 0.65)             
            .attr("y", height * 0.36)
            .attr("text-anchor", "middle")  
            .style('fill', d3.schemeSet3[4])
            .text("Lose");
}

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}