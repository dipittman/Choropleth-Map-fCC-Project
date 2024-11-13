let educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
let countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'

let countyData;
let educationData;
let svg = d3.select("#chart");
let legend = d3.select("#legend");

let drawMap = () => {
//set up for color scale
    let bachelorsOrHigher = educationData.map((item) => item.bachelorsOrHigher)
    let lowestPercent = d3.min(bachelorsOrHigher, (d) => d)
    let highestPercent = d3.max(bachelorsOrHigher, (d) => d)
    let colors = d3.schemePurples[7];
    let colorScale = d3.scaleQuantile()
                       .domain([lowestPercent, highestPercent])
                       .range(colors)

//tooltip
let toolTip = d3.select("body")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0)
                .style("width", "auto")
                .style("height", "auto")
                .style("position", "absolute")
                .style("padding", "5px")
                
//draw counties, fills them according to color Scale, displays tooltip
    svg.selectAll('path')
       .data(countyData)
       .enter()
       .append('path')
       .attr('d', d3.geoPath())
       .attr('class', 'county')
       .attr('fill', (d) => {
          let id = d.id;
          let county = educationData.find((item) => item.fips === id)
          return colorScale(county.bachelorsOrHigher)
       })
       .attr('data-fips', (d) => d.id)
       .attr('data-education', (d) => {
        let id = d.id;
        let county = educationData.find((item) => item.fips === id)
        return county.bachelorsOrHigher
       })
       .on('mouseover', (e, d) => {
            toolTip.transition()
                   .style("opacity", .8)
                   .style("left", (event.pageX + 10)+ "px") 
                   .style("top", (event.pageY) + "px")
            let id = d.id;
            let county = educationData.find((item) => item.fips === id)
            toolTip.html(`${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`)
            document.querySelector('#tooltip').setAttribute('data-education', county.bachelorsOrHigher)
       })
       .on('mouseout', (d) => {
            toolTip.transition()
                   .style("opacity", 0)
       })
//draw state border
    let borders = svg.append("path")
       .attr("fill", "none")
       .attr("stroke", "black")
       .datum(stateData, (a, b) => a !== b)
       .attr('d', d3.geoPath())
//draw legend
    let legend = svg.append("g")
                    .attr("id", "legend")
    let legendWidth = 200;
    let legendHeight = 10;

    let quantiles = colorScale.quantiles();
        quantiles.unshift(lowestPercent);
        quantiles.push(highestPercent);

    let xScaleLegend = d3.scaleLinear()
        .domain([lowestPercent, highestPercent])  
        .range([0, legendWidth])

    let xAxisLegend = d3.axisBottom(xScaleLegend)
                        .tickValues(quantiles)
                        .tickFormat(x => `${Math.round(x)}%`)

    legend.append('g')
          .attr("transform", `translate(650, 50)`)
          .call(xAxisLegend)

    legend.selectAll("rect")
          .data(colors)
          .enter()
          .append("rect")
          .attr("width", legendWidth / colors.length)
          .attr("height", legendHeight)
          .attr("x", (d, i) => 650 + i * (legendWidth / colors.length))
          .attr("y", 40)
          .attr("fill", (d) => d)
          .style("stroke", "black")
          .style("stroke-width", "1px")
}


d3.json(countyURL).then(
    (data, error) => {
        if (error) {
            console.log(error)
        } else {
            countyData = topojson.feature(data, data.objects.counties).features
            stateData = topojson.mesh(data, data.objects.states)
            d3.json(educationURL).then(
                (data, error) => {
                    if (error) {
                        console.log(error)
                    } else {
                        educationData = data;
                        console.log(educationData)
                        drawMap()
                    }
                }
            )
        }
    }
)

