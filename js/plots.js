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
    // let data_2023 = await get_json("2023");
    let data_2024 = await get_json("2024");

    if(year == "2023") {data = data_2023} else {data = data_2024}
    console.log("data ", data);

    data = data.filter((x) => x.Name == field_name);
    // console.log("data filtered", data);

    let date = data.map((x) => x.date);

    // pad with 0s
    let date_pad_zeroes = date.map((x) => {
        if(String(x).length < 6){
            return "0" + x;
        } else {
            return String(x);
        }
    });
    // console.log("date_pad_zeroes:", date_pad_zeroes);

    // make date obj
    let date_fmt = date_pad_zeroes.map((x) => {
        let s = String(x);
        return "20" + s.substring(4,6) + "-" + s.substring(0,2) + "-" + s.substring(2,4);
    });
    // console.log("date_fmt", date_fmt)

    let date_sorted = date_fmt.sort(function(a,b){
        let date_a = new Date(String(a));
        let date_b = new Date(String(b));
        if(date_a < date_b) return -1;
        else if(date_b < date_a) return 1;
        else return 0;
    });
    // console.log("dates sorted", date_sorted)
    let mean = data.map((x) => x.mean);

    // drain dates
    let drains;
    if (year == "2023"){
        drains = await get_json("conaway_drains_2023");
    } else {
        drains = await get_json("conaway_drains_2024");
    }
    console.log("drains:", drains);

    let field_drains = drains.filter((x) => x["Field #"] == field_name);
    console.log("field_drains:", field_drains);

    // get dates of events - NEED TO BE PADDED WITH ZEROES!!!
    let actual_floods = field_drains.map((drain) => new Date("20" + drain.actual_flood.substring(6,8), drain.actual_flood.substring(3,5), drain.actual_flood.substring(0,2)));
    console.log(actual_floods)
    let actual_fulls = field_drains.map((drain) => drain.actual_full);
    let actual_drains = field_drains.map((drain) => drain.actual_drain);

    // shapes for each one
    let flood_shapes = actual_floods.map((x) => {
        return {
            type: 'line',
            x0: x,
            x1: x,
            y0: 0,
            y1: 100,
            line: {
                color: 'lightblue',
                widht: 1
            }
        }
    })

    // make plotly plot
    let plot_data = [
        {
            x: date_sorted,
            y: mean,
            type: 'scatter',
            margin: {t: 0, b: 0, l: 0, r: 0},
            responsive: true
        }
    ];

    let layout = {
        title: field_name,
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

