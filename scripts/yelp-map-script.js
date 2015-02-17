//-------------------------------------------------------------------------------------------------------//
//----------------------------------- Yelp Map Script for use with Google Maps --------------------------//
// Script file customized to include initMap() function which is the entrance point to the API ----------//
//-------- initMap() function either takes 'address' string or 'position' of the location ---------------//
// The Geolocation of the 'address' string is calculated using the Google Geocoding client written by me //
//-------------------------------------------------------------------------------------------------------//


var YWSID = "Ei51l1mIoqSRDPz4s8yH2A";                               //Yelp API v1.0 YWSID key

var map = null;
var icon = null;
var img = null;

var number_of_businesses = 10;                                      //Number of businesses to display on Map
var zoom_level;										                //Zoom level on the map	
var search_term;                                                    //Search term for Yelp! API business search
//var searchLocation_LatLng = new GLatLng(43.1547, -77.6158);       //Search Location example: Latitude & Longitude combination of the search location
var searchLocation_LatLng;

/*
    map.setCenter(center,zoom) takes two parameters - Center coordinates and zoom-level. 
    Center can either be 'Address' OR 'Latitude & Longitude'.
    Note: Can use the Google GeoCoding utility to find the coordinates of a location. 
*/


/* 
*  'initMap()' Function to initialize all variables of the Map. Uses Google GeoCoding client to find coordinates from an address string.
*   Uses two conditions - if 'address' available or 'position'
*   Custom written by Hardik Shah.
*/
function initMap(searchTerm, position, address, zoomLevel)
{
    //alert("initMap function: " + search_term + " | " + position.coords.latitude + " | " + position.coords.longitude + " | " + address + " | " + zoom_level);

    zoom_level = parseInt(zoomLevel);
    search_term = searchTerm.toString();

    if (position != "")
    {
        map = new GMap2($("map"));
        searchLocation_LatLng = new GLatLng(position.coords.latitude, position.coords.longitude);

        loadMap();                                                     //Call load() to load the map
    }

    if (address != "")
    {
        var geocoder = new GClientGeocoder();                          //Find GLatLang() object coordinates of an address using Google GeoCoding
        map = new GMap2($("map"));

        geocoder.getLatLng(address, function (pt)                      //ASYNC function :: Beware
        {
            if (!pt)
            {
                alert(address + " - No coordinates available for the required address!");
            }
            else
            {
                //alert(pt);

                searchLocation_LatLng = pt;                               //Assign GLatLng() object to global variable

                loadMap();                                                //Call load() to load the map
            }
        });
    }

}

/*
 * Loads the map object and calls setCenter() function to set map parameters.
 */
function loadMap()
{
    //alert("Load function: " + searchLocation_LatLng + zoom_level + search_term);

    GEvent.addListener(map, "load", function () { if(search_term != "") { updateMap(); } });
    map.setCenter(searchLocation_LatLng, zoom_level);
    map.addControl(new GLargeMapControl());
    map.addControl(new GMapTypeControl());
    map.setMapType(G_NORMAL_MAP);

    if (window.attachEvent) window.attachEvent("onresize", function () { map.checkResize() });
    else if (window.addEventListener) window.addEventListener("resize", function () { map.checkResize() }, false);

    // setup our marker icon
    icon = new GIcon();
    icon.image = "./images/yelp_api_images/marker_star.png";
    icon.shadow = "./images/yelp_api_images/marker_shadow.png";
    icon.iconSize = new GSize(20, 29);
    icon.shadowSize = new GSize(38, 29);
    icon.iconAnchor = new GPoint(15, 29);
    icon.infoWindowAnchor = new GPoint(15, 3);
}

/*
 * Construct the URL to call for the API request
 */
function constructYelpURL()
{
    var mapBounds = map.getBounds();
    var URL = "http://api.yelp.com/" +
        "business_review_search?" +
        "callback=" + "handleResults" +
        "&term=" + search_term +
        "&num_biz_requested=" + number_of_businesses +
        "&tl_lat=" + mapBounds.getSouthWest().lat() +
        "&tl_long=" + mapBounds.getSouthWest().lng() +
        "&br_lat=" + mapBounds.getNorthEast().lat() +
        "&br_long=" + mapBounds.getNorthEast().lng() +
        "&ywsid=" + YWSID;

    return encodeURI(URL);
}

/*
 * Called on the form submission: updates the map by placing markers on it at the appropriate places
 */
function updateMap()
{
    // Create spinner animation and load into 'img' object. Insert spinner into 'poweredby' and before 'yelp-advert'

    img = document.createElement("img");
    img.setAttribute("id", "spinner");
    img.setAttribute("src", "./images/yelp_api_images/spinner.gif");
    $("poweredby").insertBefore(img, $("yelp-advert"));

    var yelpRequestURL = constructYelpURL();

    /* clear existing markers */
    map.clearOverlays();

    /* Do the API request. Uses JSON padding to add JSON response as a script in the HEAD */
    var script = document.createElement('script');
    script.src = yelpRequestURL;
    script.type = 'text/javascript';
    var head = document.getElementsByTagName('head').item(0);
    head.appendChild(script);

    return false;
}

/*
 * If a sucessful API response is received, place markers on the map.  If not, display an error.
 */
function handleResults(data)
{
    //Remove spinner loader when ready to handle results
    $("poweredby").removeChild(img);
    
    if (data.message.text == "OK")
    {
        if (data.businesses.length == 0)
        {
            alert("Sorry! No businesses were found near that location.");
            return;
        }

        for (var i = 0; i < data.businesses.length; i++)
        {
            biz = data.businesses[i];
            createMarker(biz, new GLatLng(biz.latitude, biz.longitude), i);
        }
    }
    else
    {
        alert("Error: " + data.message.text);
    }
}

/*
 * Formats and returns the Info Window HTML (displayed in a balloon when a marker is clicked)
 */
function generateInfoWindowHtml(biz)
{
    var text = '<div class="marker">';

    // image and rating
    text += '<img class="businessimage" src="' + biz.photo_url + '"/>';

    // div start
    text += '<div class="businessinfo">';
    // name/url
    text += '<a href="' + biz.url + '" target="_blank">' + biz.name + '</a><br/>';
    // stars
    text += '<img class="ratingsimage" src="' + biz.rating_img_url_small + '"/>&nbsp;based&nbsp;on&nbsp;';
    // reviews
    text += biz.review_count + '&nbsp;reviews<br/><br />';
    // categories
    text += formatCategories(biz.categories);
    // neighborhoods
    if (biz.neighborhoods.length)
        text += formatNeighborhoods(biz.neighborhoods);
    // address
    text += biz.address1 + '<br/>';
    // address2
    if (biz.address2.length)
        text += biz.address2 + '<br/>';
    // city, state and zip
    text += biz.city + ',&nbsp;' + biz.state + '&nbsp;' + biz.zip + '<br/>';
    // phone number
    if (biz.phone.length)
        text += formatPhoneNumber(biz.phone);
    // Read the reviews
    text += '<br/><a href="' + biz.url + '" target="_blank">Read the reviews »</a><br/>';
    // div end
    text += '</div></div>'
    return text;
}

/*
 * Formats the categories HTML
 */
function formatCategories(cats)
{
    var s = 'Categories: ';
    for (var i = 0; i < cats.length; i++)
    {
        s += cats[i].name;
        if (i != cats.length - 1) s += ', ';
    }
    s += '<br/>';
    return s;
}

/*
 * Formats the neighborhoods HTML
 */
function formatNeighborhoods(neighborhoods)
{
    s = 'Neighborhoods: ';
    for (var i = 0; i < neighborhoods.length; i++)
    {
        s += '<a href="' + neighborhoods[i].url + '" target="_blank">' + neighborhoods[i].name + '</a>';
        if (i != neighborhoods.length - 1) s += ', ';
    }
    s += '<br/>';
    return s;
}

/*
 * Formats the phone number HTML
 */
function formatPhoneNumber(num)
{
    if (num.length != 10) return '';
    return '(' + num.slice(0, 3) + ') ' + num.slice(3, 6) + '-' + num.slice(6, 10) + '<br/>';
}

/*
 * Creates a marker for the given business and point
 */
function createMarker(biz, point, markerNum)
{
    var infoWindowHtml = generateInfoWindowHtml(biz)
    var marker = new GMarker(point, icon);
    map.addOverlay(marker);
    GEvent.addListener(marker, "click", function ()
    {
        marker.openInfoWindowHtml(infoWindowHtml, { maxWidth: 400 });
    });
    // automatically open first marker
    if (markerNum == 0)
        marker.openInfoWindowHtml(infoWindowHtml, { maxWidth: 400 });
}