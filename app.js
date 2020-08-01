var jsonFileName = "samples.json";

// This function fills dropdown menu values from dataset and draws appropriate charts
function init() {
    var selector = d3.select("#selDataset");
    var options;
    var r;
    d3.json(jsonFileName).then((data) => {
      console.log(data);
      var sampleNames = data.names;
      sampleNames.forEach((sample) => {
        selector
          .append("option")
          .text(sample)
          .property("value", sample);
      });
      let e = document.getElementById("selDataset");
      r = e.options[0].value;
      console.log("E: " + r);
      optionChanged(r);
    });
}

// Created a function that retrieves values from json file and creates metadata dictionary.

// Will also take each element of the dictionary and put in on the demographic panel
 
function buildMetadata(sample) {
  d3.json(jsonFileName).then((data) => {
      let title = "";
      var metadata = data.metadata;
      var resultArray  = metadata.filter(sampleObj => sampleObj.id == sample);
      var result = resultArray[0];
      console.log(result);

      var PANEL = d3.select("#sample-metadata");
      PANEL.html("");

      Object.keys(result).forEach(function(key) {
        console.log(key.toUpperCase(), result[key]);
        PANEL.append("h6").text(key.toUpperCase() + ": " + result[key]);
      });
  });
}

// Uses data from JsonFile and builds charts 

function buildCharts(sample) {
  var samples;
  d3.json(jsonFileName).then((data) => {

    // getting metadata dictionary to get wfreq value for guage chart

    var metadata = data.metadata;
    var resultArrayMeta  = metadata.filter(sampleObj => sampleObj.id == sample);
    var resultMeta = resultArrayMeta[0];
    console.log("WFRQ: " + resultMeta.wfreq);
    
    // slicing data to get top 10 sample values and OTU labels.

    samples = data.samples;
    var resultArray  = samples.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    console.log(result);

    let otu_ids = result.otu_ids;
    let firstTenOtu = otu_ids.slice(0,10);

    let sampleValues = result.sample_values;
    let firstTenSamples = sampleValues.slice(0,10);

    let otuLabels = result.otu_labels;

    let firstTenOtuLable = firstTenOtu.map(otu => "OTU " + otu);

    buildBarChart(firstTenSamples, firstTenOtuLable, sample);
    buildBubbleChart(otu_ids, sampleValues, otuLabels)
    buildGaugeChart(resultMeta.wfreq);
  });

}


// Plot bar chart using the sliced data and labels
// putting the sliced data in reverse order so that we see descending order (highest first)

function buildBarChart(firstTenSamples, firstTenOtuLable, sample) {
  var trace = {
    x: firstTenSamples.reverse(),
    y: firstTenOtuLable.reverse(),
    type: "bar",
    orientation: 'h'
  };

  var data = [trace];
  Plotly.newPlot("bar", data);
}

// Plot bubble chart for sliced data and labels

function buildBubbleChart(otu_ids, sampleValues, otuLabels) {
  var trace = {
    x: otu_ids,
    y: sampleValues,
    text: otuLabels,
    mode: 'markers',
    marker: {
      color: otu_ids,
      size: sampleValues,
      colorscale: 'Earth'
    }
  };

  var data = [trace];
  var layout = {
    showlegend: false,
    height: 500,
    width: 1000
  };
  
  Plotly.newPlot('bubble', data, layout);
}

// plot a gauge chart with a moving needle based on wfreq

function buildGaugeChart(wfreq) {

  // Enter a speed between 0 and 180
  var level = parseFloat(wfreq) * 20;
  console.log("LEVEL: " + level);

  // calculate where the needle position should be using trig to calculate the meter point. 
 
  var degrees = 180 - level;
  console.log("DEGREES: "+ degrees);

  radius = .5;
  var radians = (degrees * Math.PI) / 180;
  console.log("RADIANCE: " + radians);

  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  console.log('X angle: ' + x);
  console.log('Y angle: ' + y);
  console.log('DEGREES: ' + degrees);

  var path1 = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L ' : 'M -0.025 -0.0 L 0.025 0.0 L ';
  console.log("PATH 1: " + path1)
  
  var mainPath = path1,
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';

  var path = mainPath.concat(pathX,space,pathY,pathEnd);
  console.log("PATH: " + path);

  var data = [
    { 
      type: 'scatter',
      x: [0], 
      y:[0],
      marker: {size: 14, color:'850000'},
      showlegend: false,
      name: 'Freq',
      text: level,
      hoverinfo: 'text+name'
    },
    { 
      values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
      rotation: 90,
      text: ['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1',''],
      textinfo: 'text',
      textposition:'inside',
      marker: 
      {
        colors:[
          "rgba(255, 105, 11, .5)",
          "rgba(255, 120, 22, .5)",
          "rgba(255, 127, 0, .5)",
          "rgba(255, 154, 22, .5)",
          "rgba(255, 202, 42, .5)",
          "rgba(255, 209, 95, .5)",
          "rgba(255, 206, 145, .5)",
          "rgba(255, 226, 202, .5)",
          "rgba(255, 230, 215, .5)",
          "rgba(255, 0, 0, 0)"
        ]
      },
      labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }
  ];

  var layout = {
    shapes:[
      {
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }
    ],
    title: "<b>Belly Button Washing Frequency</b> <br> Scrubs per Week",
    height: 400,
    width: 400,
    xaxis: {
      zeroline:false, showticklabels:false,
      showgrid: false, range: [-1, 1]
    },
    yaxis: {
      zeroline:false, showticklabels:false,
      showgrid: false, range: [-1, 1]
    }
  };

  Plotly.newPlot('gauge', data, layout);
}

function optionChanged(newSample) {
  console.log(newSample);
  buildMetadata(newSample);
  buildCharts(newSample);
}

init();