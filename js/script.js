let currentScene = 0;

d3.csv("data/flights.csv").then(data => {
  data.forEach(d => {
    d.price = +d.price;
    d.days_left = +d.days_left;
  });

  showScene0(data);

d3.select("#nextBtn").on("click", () => {
    currentScene++;
    if (currentScene === 1) showScene1(data);
    else if (currentScene === 2) showScene2(data);
  });
});

function showScene0(data) {
  d3.select("#vis").html("");
  d3.select("#dropdownContainer").style("display", "none");

  const svg = d3.select("#vis").append("svg")
    .attr("width", 800).attr("height", 500);

  const airlines = [...new Set(data.map(d => d.airline))];
  const avgPrice = d3.rollups(data, v => d3.mean(v, d => d.price), d => d.airline);
  avgPrice.sort((a, b) => b[1] - a[1]);

  const x = d3.scaleBand()
    .domain(avgPrice.map(d => d[0]))
    .range([80, 750]).padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(avgPrice, d => d[1])])
    .range([450, 50]);

  svg.append("g").attr("transform", "translate(0,450)").call(d3.axisBottom(x));
  svg.append("g").attr("transform", "translate(80,0)").call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(avgPrice)
    .enter().append("rect")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1]))
    .attr("width", x.bandwidth())
    .attr("height", d => 450 - y(d[1]))
    .attr("fill", "steelblue");

  svg.append("text")
    .attr("x", 400).attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Average Price by Airline");

  // ... existing svg, x, y code ...

    svg.append("text")
    .attr("x", 400)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Average Price by Airline");

    // X Axis Label
    svg.append("text")
    .attr("x", 400)
    .attr("y", 490)
    .attr("text-anchor", "middle")
    .text("Airline");

    // Y Axis Label
    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -250)
    .attr("y", 20)
    .text("Average Price");

}

function showScene1(data) {
  d3.select("#vis").html("");
  d3.select("#dropdownContainer").style("display", "none");

  const svg = d3.select("#vis").append("svg")
    .attr("width", 800).attr("height", 500);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.days_left)])
    .range([80, 750]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.price)])
    .range([450, 50]);

  svg.append("g").attr("transform", "translate(0,450)").call(d3.axisBottom(x));
  svg.append("g").attr("transform", "translate(80,0)").call(d3.axisLeft(y));

  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", d => x(d.days_left))
    .attr("cy", d => y(d.price))
    .attr("r", 3)
    .attr("fill", "darkred")
    .attr("opacity", 0.6);

  svg.append("text")
    .attr("x", 400).attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Price vs. Days Left Until Flight");

    // ... existing svg, x, y code ...

    svg.append("text")
    .attr("x", 400)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Price vs. Days Left Until Flight");

    // X Axis Label
    svg.append("text")
    .attr("x", 400)
    .attr("y", 490)
    .attr("text-anchor", "middle")
    .text("Days Left Until Flight");

    // Y Axis Label
    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -250)
    .attr("y", 20)
    .text("Price");

}

function showScene2(data) {
  d3.select("#vis").html("");
  d3.select("#dropdownContainer").style("display", "inline");

  const svg = d3.select("#vis").append("svg")
    .attr("width", 800).attr("height", 500);

  const airlines = [...new Set(data.map(d => d.airline))];
  const dropdown = d3.select("#airlineDropdown")
    .on("change", () => updateChart(dropdown.property("value")));

  dropdown.selectAll("option")
    .data(airlines)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  function updateChart(selectedAirline) {
    svg.selectAll("*").remove();

    const airlineData = data.filter(d => d.airline === selectedAirline);

    const x = d3.scaleLinear()
      .domain([0, d3.max(airlineData, d => d.price)])
      .range([80, 750]);

    const histogram = d3.histogram()
      .value(d => d.price)
      .domain(x.domain())
      .thresholds(x.ticks(20));

    const bins = histogram(airlineData);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([450, 50]);

    svg.append("g").attr("transform", "translate(0,450)").call(d3.axisBottom(x));
    svg.append("g").attr("transform", "translate(80,0)").call(d3.axisLeft(y));

    svg.selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.length))
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("height", d => 450 - y(d.length))
      .attr("fill", "seagreen");

    svg.append("text")
      .attr("x", 400).attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text(`Price Distribution for ${selectedAirline}`);
    
    svg.append("text")
    .attr("x", 400)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text(`Price Distribution for ${selectedAirline}`);

    // X Axis Label
    svg.append("text")
    .attr("x", 400)
    .attr("y", 490)
    .attr("text-anchor", "middle")
    .text("Price");

    // Y Axis Label
    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -250)
    .attr("y", 20)
    .text("Number of Flights");

  }

  updateChart(dropdown.property("value"));
}
