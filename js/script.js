let currentScene = 0;
let flightData;
let selectedClass = "Economy"; // You can add UI later to change this if you want
let selectedAirline = "All";

const figure = d3.select("#vis");
const annotationDiv = d3.select("#annotation");
const dropdownContainer = d3.select("#dropdownContainer");
const airlineDropdown = d3.select("#airlineDropdown");

// Load CSV data
d3.csv("data/flights.csv", d3.autoType).then(data => {
  flightData = data;

  // Populate airline dropdown
  const airlines = Array.from(new Set(flightData.map(d => d.airline))).sort();
  airlineDropdown.selectAll("option")
    .data(["All", ...airlines])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  airlineDropdown.on("change", function () {
    selectedAirline = this.value;
    if (currentScene === 2) {
        updateScene(currentScene);
    }
    });

  updateScene(currentScene);
});

// Next scene button
d3.select("#nextBtn").on("click", () => {
  currentScene = (currentScene + 1) % 3;
  updateScene(currentScene);
});

function updateScene(sceneIndex) {
  figure.selectAll("svg").remove();
  annotationDiv.text("");

  const svg = figure.append("svg")
    .attr("width", 800)
    .attr("height", 500);

  const margin = { top: 60, right: 40, bottom: 70, left: 90 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Filter data by class and airline
  let filteredData = flightData.filter(d => d.class === selectedClass);
  if (selectedAirline !== "All") {
    filteredData = filteredData.filter(d => d.airline === selectedAirline);
  }

  let xScale, yScale, xLabel, yLabel, annotation;

  if (sceneIndex === 0) {
    // Scene 0: Average Price by Airline (bar chart)
    dropdownContainer.style("display", "none");

    const avgPrice = d3.rollups(
      filteredData,
      v => d3.mean(v, d => d.price),
      d => d.airline
    );
    avgPrice.sort((a, b) => b[1] - a[1]);

    xScale = d3.scaleBand()
      .domain(avgPrice.map(d => d[0]))
      .range([0, width])
      .padding(0.3);

    yScale = d3.scaleLinear()
      .domain([0, d3.max(avgPrice, d => d[1])])
      .nice()
      .range([height, 0]);

    g.selectAll("rect")
      .data(avgPrice)
      .join("rect")
      .attr("x", d => xScale(d[0]))
      .attr("y", d => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d[1]))
      .attr("fill", "steelblue");

    // Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    g.append("g")
      .call(d3.axisLeft(yScale));

    xLabel = "Airline";
    yLabel = "Average Price (USD)";
    annotation = "Average flight price by airline for Economy class.";

  } else if (sceneIndex === 1) {
    // Scene 1: Price vs. Days Left (scatterplot)
    dropdownContainer.style("display", "none");

    xScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.days_left))
      .nice()
      .range([0, width]);

    yScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.price))
      .nice()
      .range([height, 0]);

    g.selectAll("circle")
      .data(filteredData)
      .join("circle")
      .attr("cx", d => xScale(d.days_left))
      .attr("cy", d => yScale(d.price))
      .attr("r", 4)
      .attr("fill", "darkred")
      .attr("opacity", 0.5);

    // Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .call(d3.axisLeft(yScale));

    xLabel = "Days Left Until Flight";
    yLabel = "Price (USD)";
    annotation = "Flight prices tend to rise as the departure date approaches.";

  } else if (sceneIndex === 2) {
    // Scene 2: Price Distribution for Selected Airline (histogram)
    dropdownContainer.style("display", "block");

    // Filtered by airline and class (already filtered)
    let airlineData = filteredData;

    const xMax = d3.max(airlineData, d => d.price) || 1000;

    xScale = d3.scaleLinear()
      .domain([0, xMax])
      .nice()
      .range([0, width]);

    // Histogram
    const histogram = d3.histogram()
      .value(d => d.price)
      .domain(xScale.domain())
      .thresholds(xScale.ticks(20));

    const bins = histogram(airlineData);

    yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .nice()
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .call(d3.axisLeft(yScale));

    g.selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", d => xScale(d.x0) + 1)
      .attr("y", d => yScale(d.length))
      .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", d => height - yScale(d.length))
      .attr("fill", "seagreen")
      .attr("opacity", 0.7);

    xLabel = "Price (USD)";
    yLabel = "Number of Flights";
    annotation = selectedAirline === "All" ? 
      "Price distribution for all airlines in Economy class." :
      `Price distribution for ${selectedAirline} in Economy class.`;
  }

  // Axis labels
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text(xLabel);

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text(yLabel);

  // Annotation text
  annotationDiv.text(annotation);

  if (sceneIndex === 2) {
    d3.select("#nextBtn").style("display", "none");
  } else {
    d3.select("#nextBtn").style("display", "inline-block");
  }
}
