// console.log("js is loaded")

var data;

function optionChanged(ID){
    metadata(ID);
    graph(ID);
}
// Create Dropdown menu options from imported data
function dropdown(){
    var selector = d3.select("#selDataset")
    for(var i = 0; i < data.names.length; i++){
           // Append text and value

        selector
            .append("option")
            .attr("value", data.names[i])
            .text(data.names[i])
    }
    optionChanged(data.names[0])
}

// Create a filter to isolate demographic data for each ID
function metadata(ID){
    var demographics = data.metadata.filter(object => object.id == ID)[0]
// transfrom from an object to array
    var new_demographics = Object.entries(demographics)

    var selector = d3.select("#sample-metadata") // selector from index.html

    // every time metadata is called, it will clear current selection and replace with new selection
    selector.html("")
    
    // looping through new array
    for(var i = 0; i < new_demographics.length; i++){
    
// select each individual array inside new_demographics one at at time    
        var row = new_demographics[i]
     
        selector
            .append("p")
            .text(`${row[0]}: ${row[1]}`)
        // Append text and value
  //      console.log(`${row[0]}: ${row[1]}`); //javascript version of a python F string

 }
}

function graph(ID){
    console.log("graph: " + ID)

    // Create variables for charts

    var sample_values = data.samples.filter(object => object.id == ID)[0]

    var otu_ids = sample_values.otu_ids
    var sample_values = sample_values.sample_values
    var otu_labels = sample_values.otu_labels

    // Create bar chart. I tried to isolate the top 10 but can't figure out how to do that

    var trace1 = {
  
        x: sample_values, // .slice(0,10),
        y: otu_ids, // .slice(0,10),
        text: otu_labels, // .slice(0,10),
        type: "bar",
        orientation: "h"
    
      };
    
      // data
      var chartData = [trace1];
    
      // Render the plot
      Plotly.newPlot("bar", chartData);


      // Create bubblechart

      var trace2 = {
  
        x: otu_ids,
        y: sample_values,
        text: otu_labels,
        mode: "markers",
        marker: {
            color: otu_ids,
            size: sample_values
        }
    
      };
    
      // data
      var bubbleData = [trace2];
    
      // Render the plot
      Plotly.newPlot("bubble", bubbleData); 
     }


// Import Data
d3.json("./data/samples.json").then(function(response){
    console.log(response)
    data=response
    dropdown()
})