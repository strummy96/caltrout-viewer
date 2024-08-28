// leaflet
let map;
let raster_layer;
let year = "2024";
let dates_2023 = ['010123', '010623', '011123', '011323', '011823', '012323', '012523', '013023', '020423', '020623', '021123', '021623', '021823', '022323', '022823', '030223', '030723', '031223', '031423', '031923', '032423', '032623', '033123', '040523', '040723', '041223', '041723', '041923', '042423', '042923', '050123', '100222', '100722', '100922', '101422', '102122', '102622', '103122', '110222', '110722', '111222', '111422', '111922', '112422', '112622', '120122', '120622', '120822', '121322', '121822', '122022', '122522', '123022'];
let dates_2024 = ['010124', '010624', '010824', '011324', '011824', '012024', '012524', '013024', '020124', '020624', '021124', '021324', '021824', '022324', '022524', '030124', '030624', '030824', '031324', '031824', '032024', '032524', '033024', '040124', '040624', '041124', '041324', '041824', '042324', '042524', '043024', '100223', '100423', '100923', '101423', '101623', '102123', '102823', '110223', '110923', '111423', '111923', '112123', '112623', '120123', '120323', '120823', '121323', '121523', '122023', '122523', '122723'];

async function init_map(){

    open_loading_screen();

    map = L.map('map-view', {zoomControl: false}).setView([38.65359090738684, -121.65299749322004], 12);

    // osm
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">ESRI</a>'
    }).addTo(map);

    // add fields
    let fields_geojson = await get_geojson('data/geojson/fields.geojson');
    console.log(fields_geojson)
    let fields_layer = L.geoJSON(fields_geojson, {
        weight: 1,
        color: 'yellow',
        fillColor: '#00000000',
        onEachFeature: function(feature, layer){
            layer.bindTooltip(feature.properties.Name, {sticky: true});
            layer.addEventListener('mouseover', (e) => {e.target.setStyle({fillColor: '#faf43c88'})});
            layer.addEventListener('mouseout', (e) => {e.target.setStyle({fillColor: '#00000000'})});
            layer.on('click', (e) => {
                console.log(e);
                new_plot(year, e.target.feature.properties.Name); // change displayed plot
                fields_layer.resetStyle();  // make all fields yellow again (undo previous selection)
                e.target.setStyle({color: 'red'}); // make clicked field red
            })
        }
    });
    // fields_layer.bindTooltip({content: layer.feature.properties.Name, sticky: true});
    // fields_layer.on('mousover', function (e) {console.log('popup'); this.openPopup()})
    fields_layer.addTo(map);

    // add dates to dropdown
    let ul = document.querySelector("#date-dropdown-ul");
    for(date of dates_2024){
        let li = document.createElement('li');
        let btn = document.createElement('button');
        btn.classList.add('dropdown-item');
        btn.type = "button";
        btn.textContent = date;
        btn.onclick = function(){
            add_new_raster(year, this.textContent);
        };
        li.append(btn);
        ul.append(li);
    }

    close_loading_screen();
}

init_map();

// unresolved
async function get_geojson(path){
    let resp = await fetch(path);
    let data = await resp.json();
    return data;
} 


function open_loading_screen() {
    console.log("open_loading_screen")
    let ls = document.querySelector("#loading-screen");
    ls.style.display = "flex";
    ls.style.zIndex = 1000;
}

function close_loading_screen() {
    console.log("close_loading_screen")
    let ls = document.querySelector("#loading-screen");
    ls.style.display = "none";
}

async function new_raster(year, date){
    // georaster
    let resp = await fetch('data/raster/' + year + '/sar_vv_' + date + '_mosaic.tif');
    let data = await resp.arrayBuffer();
    let gr = await parseGeoraster(data);
    console.log(gr);

    const min = gr.mins[0];
    const max = gr.maxs[0];
    lyr = new GeoRasterLayer({
        georaster: gr,
        resolution: 128,
        pixelValuesToColorFn: function(pixelValues) {
                  var pixelValue = pixelValues[0]; // there's just one band in this raster

                  // scale to 0 - 1 used by chroma
                  var scaledPixelValue = (pixelValue) / 255;
                  let scale = chroma.scale('YlGnBu').domain([1,0]).gamma(1.5);
                  var color = scale(scaledPixelValue).hex();

                  return color;
        }
    });

    return lyr;
}

async function add_new_raster(year, date){
    console.log("Adding new raster - date:", date);
    // update date display
    let dd = document.querySelector("#date-display");
    dd.textContent = pretty_date(date);
    try{
        raster_layer.remove();
    } catch (e) {
        console.log(e)
    }
    raster_layer = await new_raster(year, date);
    raster_layer.addTo(map);
}

function pick_date(date){
    // remove current raster
    raster_layer.remove()

    // add new raster
    raster_layer = L.GeoRasterLayer
}

function new_plot(year, field_name){
    let img = document.querySelector('#plot img');
    img.src = "data/png/" + year + "/conway/" + field_name + ".png"
}

function set_year(yr){
    // button styles
    let btn_2023 = document.querySelector("#btn-2023");
    let btn_2024 = document.querySelector("#btn-2024");
    if(yr=="2023"){
        btn_2023.classList.add('btn-dark');
        btn_2023.classList.remove('btn-light');
        btn_2024.classList.add('btn-light');
        btn_2024.classList.remove('btn-dark');
    } else {
        btn_2023.classList.add('btn-light');
        btn_2023.classList.remove('btn-dark');
        btn_2024.classList.add('btn-dark');
        btn_2024.classList.remove('btn-light');
    }

    // set global variable
    year = yr;

    // change dropdown values
    let ul = document.querySelector("#date-dropdown-ul");
    ul.innerHTML = ""; // clear it
    let yr_picker = {'2023': dates_2023, '2024': dates_2024};
    for(date of yr_picker[year]){
        let li = document.createElement('li');
        let btn = document.createElement('button');
        btn.classList.add('dropdown-item');
        btn.type = "button";
        btn.textContent = date;
        btn.onclick = function(){
            add_new_raster(year, this.textContent)
        };
        li.append(btn);
        ul.append(li);
    }
}

function pretty_date(date){
    // take a MMDDYY date and return MM/DD/YY
    let d = date.substring(0,2) + '/' + date.substring(2,4) + '/' + date.substring(4,6);
    console.log(date.substring(0,1))
    return d;
}
