// set the dimensions and margins of the graph
var margin = {top: 100, right: 100, bottom: 100, left: 100},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line 1
var valueline = d3.line()
    .x(function(d) { return x(d._time); })
    .y(function(d) { return y(d.access); });
// define the line 2
var valueline2 = d3.line()
    .x(function(d) { return x(d._time); })
    .y(function(d) { return y(d.audit); });
// define the line 3
var valueline3 = d3.line()
    .x(function(d) { return x(d._time); })
    .y(function(d) { return y(d.endpoint); });

// append the svg obgect
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// gridlines in y axis function
function make_y_gridlines() {		
    return d3.axisLeft(y)
    .ticks(5)
}

// Get the data
d3.json("data.json", function(error, data) {
    if (error) throw error;

    // trigger render
    draw(data, "fields");
});

// Add Legends
var ordinal = d3.scaleOrdinal()
    .domain(["Access", "Audit", "Endpoint"])
    .range([ "steelblue", "red", "green"]);

svg.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate("+(width+20)+","+(margin.top-50)+")");

var legendOrdinal = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolTriangle).size(100)())
    .shapePadding(10) 
    //use cellFilter to hide the "e" cell
    .cellFilter(function(d){ return d.label !== "e" })
    .scale(ordinal);

svg.select(".legendOrdinal")
    .call(legendOrdinal);

// Render
function draw(data, items) {
    var data = data[items];

    // format the data
    data.forEach(function(d) {
        var splits = d._time.split('.');
        d._time = parseTime(splits[0]);
        d.access = +d.access;
        d.audit = +d.audit;
        d.endpoint = +d.endpoint;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d._time; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.access, d.audit, d.endpoint) + 30; })]);

    // add the Y gridlines
    svg.append("g")			
        .attr("class", "grid")
        .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
        );

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line1")
        .attr("d", valueline);
    
    svg.append("path")
        .data([data])
        .attr("class", "line2")
        .attr("d", valueline2);
    
    svg.append("path")
        .data([data])
        .attr("class", "line3")
        .attr("d", valueline3);

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add title
    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text("Notable Events Over Time");

    // text label for the x axis
    svg.append("text")             
        .attr("transform", "translate(" + (width/2) + " ," + (height + 50) + ")")
        .style("text-anchor", "middle")
        .text("time");

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("count");
}