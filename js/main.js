let map;
async function init_map(){

    open_loading_screen();

    map = L.map('map-view').setView([39.006664, -121.772909], 9);

    // osm
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">ESRI</a>'
    }).addTo(map);
    
    // test raster
    // L.imageOverlay(
    //     'data/raster/NDWI_012423_mosaic_WGS84.png',
    //     [[38.0501184391033291, -122.0439969421559852], [39.3041225336850459, -121.4857963617521222]]
    // ).addTo(map);
    // L.imageOverlay(
    //     'data/raster/NDWI_012423_mosaic.png',
    //     [[38.0501184391033291, -122.0439969421559852], [39.3041225336850459, -121.4857963617521222]]
    // ).addTo(map);

    // georaster
    let resp = await fetch('data/raster/NDWI_012423_mosaic.tif');
    let data = await resp.arrayBuffer();
    let gr = await parseGeoraster(data);
    console.log(gr);

    const min = gr.mins[0];

    let layer = new GeoRasterLayer({
        georaster: gr,
        resolution: 128,
        pixelValuesToColorFn: function(pixelValues) {
                  var pixelValue = pixelValues[0]; // there's just one band in this raster

                  // scale to 0 - 1 used by chroma
                  var scaledPixelValue = (pixelValue - min) / 255;
                  let scale = chroma.scale(['black', 'white']);
                  var color = scale(scaledPixelValue).hex();

                  return color;
        }
    });
    layer.addTo(map);
    console.log(layer.getColor([100]));

    // add fields
    let fields_geojson = await get_geojson('data/geojson/fields.geojson');
    console.log(fields_geojson)
    L.geoJSON(fields_geojson, {}).addTo(map);

    close_loading_screen();
}

init_map();

// let parse_georaster = require("georaster");

// let GeoRasterLayer = require("georaster-layer-for-leaflet");

// let test = new GeoRasterLayer()

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

// from an incredible person on github https://gist.github.com/gskema/2f56dc2e087894ffc756c11e6de1b5ed
function colorGradient(fadeFraction, rgbColor1, rgbColor2, rgbColor3) {
    var color1 = rgbColor1;
    var color2 = rgbColor2;
    var fade = fadeFraction;

    // Do we have 3 colors for the gradient? Need to adjust the params.
    if (rgbColor3) {
      fade = fade * 2;

      // Find which interval to use and adjust the fade percentage
      if (fade >= 1) {
        fade -= 1;
        color1 = rgbColor2;
        color2 = rgbColor3;
      }
    }

    var diffRed = color2.red - color1.red;
    var diffGreen = color2.green - color1.green;
    var diffBlue = color2.blue - color1.blue;

    var gradient = {
      red: parseInt(Math.floor(color1.red + (diffRed * fade)), 10),
      green: parseInt(Math.floor(color1.green + (diffGreen * fade)), 10),
      blue: parseInt(Math.floor(color1.blue + (diffBlue * fade)), 10),
    };

    return [gradient.red, gradient.green, gradient.blue];
  }

function colorGradientFromValue(value){
    console.log("values: ", value);
    let gradient = colorGradient(1/255, {red:0,green:0,blue:0}, {red:255,green:255,blue:255});
    
    console.log("color gradient: ", gradient)
    return rgbToHex(gradient[0], gradient[1], gradient[2]);
}

function componentToHex(c) {
    console.log('component to hex: ', c)
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
    console.log('rgb to hex: ', r, g, b)
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}