// test
async function get_json(json){
    let resp = await fetch("data/json/" + json + ".json");
    let data = await resp.json();
    console.log(data);
    return data;
}

// working on getting proper json format for plotly



async function make_plot(field_name, year) {
    let data;
    // let data_2023 = await get_json("2023");
    let data_2024 = await get_json("2024");

    if(year == "2023") {data = data_2023} else {data = data_2024}
    console.log("data ", data);

    data = data.filter((x) => x.Name == field_name);
    console.log("data filtered", data);

    let date = data.map((x) => x.date);

    // pad with 0s
    

    // make date obj
    let date_fmt = date.map((x) => {
        let s = String(x);
        return "20" + s.substring(4,6) + "-" + s.substring(0,2) + "-" + s.substring(2,4);
    });
    console.log("date_fmt", date_fmt)
    let date_sorted = date.sort(function(a,b){
        let date_a = new Date(String(a));
        let date_b = new Date(String(b));
        if(date_a < date_b) return -1;
        else if(date_b < date_a) return 1;
        else return 0;
    });
    console.log("dates sorted", date_sorted)
    let mean = data.map((x) => x.mean);
    // console.log(date, mean);

} make_plot("055D", "2024");

