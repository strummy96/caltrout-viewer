// test
async function get_json(json){
    let resp = await fetch("data/json/" + json + ".json");
    let data = await resp.json();
    // console.log(data);
    return data;
}

// working on getting proper json format for plotly



async function make_plot(year, field_name) {
    let data;
    let data_2023 = await get_json("2023");
    let data_2024 = await get_json("2024");

    if(year == "2023") {data = data_2023} else {data = data_2024}
    // console.log("data ", data);

    data = data.filter((x) => x.Name == field_name);
    // console.log("data filtered", data);

    let date = data.map((x) => x.date_date);
    // console.log(date)

    let mean = data.map((x) => x.mean);

    // cycle dates
    let cycles;
    let flood_shapes = [];
    try {
        if (year == "2023"){
            cycles = await get_json("conaway_cycles_2023");
        } else {
            cycles = await get_json("conaway_cycles_2024");
        }
        // console.log("cycles:", cycles);
    
        let field_cycles = cycles.filter((x) => x["Field #"] == field_name);
        // console.log("field_cycles:", field_cycles);
    
        // get dates of events - need to be padded with 0s in some cases
        let actual_floods = get_padded_dates("actual_flood", field_cycles);
        // console.log(actual_floods)
        let actual_fulls = get_padded_dates("actual_full", field_cycles);
        // console.log(actual_fulls)
        let actual_drains = get_padded_dates("actual_drain", field_cycles);
        // console.log(actual_drains)
    
        // shapes for each one
        let floods_shapes = actual_floods.map((x) => {
            return {
                type: 'line',
                showlegend: true,
                x0: x,
                x1: x,
                y0: 0,
                y1: 100,
                line: {
                    color: 'lightblue',
                    width: 1
                },
                name: "Flood"
            }
        });
    
        let fulls_shapes = actual_fulls.map((x) => {
            return {
                type: 'line',
                showlegend: true,
                x0: x,
                x1: x,
                y0: 0,
                y1: 100,
                line: {
                    color: 'blue',
                    width: 1
                },
                name: "Full"
            }
        });
    
        let drains_shapes = actual_drains.map((x) => {
            return {
                type: 'line',
                showlegend: true,
                x0: x,
                x1: x,
                y0: 0,
                y1: 100,
                line: {
                    color: 'red',
                    width: 1
                },
                name: "Drain"
            }
        });
        
        flood_shapes = [].concat(floods_shapes, fulls_shapes, drains_shapes);
    } catch(e) {
        console.log("No drain dates for this year/field.")
    }

    // make plotly plot
    let plot_data = [
        {
            x: date,
            y: mean,
            // type: 'scatter',
            mode: 'lines+markers',
            margin: {t: 0, b: 0, l: 0, r: 0},
            name: "SAR",
            line: {
                color: 'black'
            }
        }
    ];

    let layout = {
        title: field_name,
        showlegend: true,
        yaxis: { range: [0, 100], title: "Mean" },
        xaxis: { 
            nticks: 50,
            tickwidth: 2,
            tickformat: "%m/%d",
            title: "Date" 
        },
        shapes: flood_shapes
    };

    let config = { responsive: true };

    Plotly.newPlot('plotly-div', plot_data, layout, config);

} // make_plot("055D", "2024");

function get_padded_dates(event, field_cycles){
    return field_cycles.map((cycle) => {
        let af = cycle[event];
        let af_split = af.split("/");
        console.log("af_split:", af_split)
        let af_split_padded = af_split.map((x) => {if(x.length == 1){return "0" + x} else {return x}});
        console.log("af_split_padded:", af_split_padded)
        console.log(Number("20" + af_split_padded[2]), Number(af_split_padded[0]) - 1, Number(af_split_padded[1]))
        return new Date(Number("20" + af_split_padded[2]), Number(af_split_padded[0]) - 1, Number(af_split_padded[1]));
    });
}