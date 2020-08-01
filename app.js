var jsonFileName = "samples.json";

/* This function fills dropdown menu values from dataset and draws appropriate charts */
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

/*
  This funtion gets value from json file then gets metadata dictionary
  and gets values of each element from dictionary and then prints 
  it to the panel.
*/
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

/*
  This function gets data from json file and then for selected sample ID gets other information
  and calls other graph functions to plot the data.
*/
function buildCharts(sample) {
  var samples;
  d3.json(jsonFileName).then((data) => {
    // getting metadata dictionary to get wfreq value for guage chart
    var metadata = data.metadata;
    var resultArrayMeta  = metadata.filter(sampleObj => sampleObj.id == sample);
    var resultMeta = resultArrayMeta[0];
    console.log("WFRQ: " + resultMeta.wfreq);
    
    // getting samples for selected id to get 10 sample values and corrospoing
    // otu labels
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


/*
  This function plots bar chart with first 10 samples and corrosponding lables.
*/
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

/*
  This function plots bubble chart for sample_values for selected id
*/
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

/*
  This function create a gauge chart and moves needle according to wash frequncy
*/
function buildGaugeChart(wfreq) {
  // Enter a speed between 0 and 180
  var level = parseFloat(wfreq) * 20;
  console.log("LEVEL: " + level);

  /*
    This code to calculate needle and its position.
  */
  // Trig to calc meter point
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
          "rgba(0, 105, 11, .5)",
          "rgba(10, 120, 22, .5)",
          "rgba(14, 127, 0, .5)",
          "rgba(110, 154, 22, .5)",
          "rgba(170, 202, 42, .5)",
          "rgba(202, 209, 95, .5)",
          "rgba(210, 206, 145, .5)",
          "rgba(232, 226, 202, .5)",
          "rgba(240, 230, 215, .5)",
          "rgba(255, 255, 255, 0)"
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