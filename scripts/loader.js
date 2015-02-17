//-----------------------------------------------------------------//
//---- JavaScript 'Places' Class file for loading all controls ----//
//-----------------------------------------------------------------//


//class Places

function Places()                                               //Class Constructor
{
    //Make an AJAX call to destroy all existing nodes, retrieve a new dataset, initialize  

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function ()
    {
        if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200))             //When the AJAX response is received
        {
            //Step 1: Empty Parent Node 'controls' and 'geolocation-feature'

            emptyParentNode("controls");
            emptyParentNode("geolocation-feature");

            //Step 2: Load AJAX response into JSON object. [Currently, in the context of AJAX function, can access class functions and variables here]
            //Data should be in the form of [Label name, Node level, Zoom level, --Select--, Value1, Value2, Value3]

            if (!ielt8)                                                     //If (browser !< IE8), use JSON native capability
            {
                p.data = JSON.parse(xmlhttp.responseText);
            }
            else                                                            //If (browser < IE8), use JSON-sans-eval library
            {
                p.data = jsonParse(xmlhttp.responseText);
            }

            //Step 3: Find the first node (i.e. 'init' node for countries) from JSON object

            p.firstNodeValue = firstNodeInJSON(p.data);

            //Step 4: Find the last node (i.e. category for possible Yelp! categories) from JSON object

            p.catNodeValue = lastNodeInJSON(p.data);

            //Step 5: Initialize all map variables. Set a default address for the map to start with.

            p.zoomLevel = 0;
            p.searchTerm = "";
            p.address = "India";

            //Step 6: Call 'createChildNode()' function by passing value of first node

            p.createChildNode(p.firstNodeValue);

            //Step 7: Call 'createGeolocationFeature()' to create Category Dropdownlist and 'I'm Feeling Lucky!' button

            p.createGeolocationFeature();
        }
    }

    xmlhttp.open("GET", "./scripts/dataset.js", "true");
    xmlhttp.send();
}

var p = new Places();                                            //Can pass the 'value' of currently selected DDL from localStorage/Cookie

Places.prototype.firstNodeValue;                                 //Class variable for containing the first node (i.e. starting node) in JSON
Places.prototype.data;                                           //Class variable for containing the JSON object
Places.prototype.address;                                        //Class variable for containing the Address string
Places.prototype.catNodeValue;                                   //Class variable for containing the category node (i.e. last node) in JSON
Places.prototype.zoomLevel;                                      //Class variable for containing the zoom level of the map
Places.prototype.locationLatLng;                                 //Class variable for containing the position object for Geolocation feature
Places.prototype.searchTerm;                                     //Class variable for containing the search term string
Places.prototype.divTopPosition = -120;                          //Class variable for containing the start top position for div animation

Places.prototype.createChildNode = function (node)               //createChildNode() function to create Dropdownlist controls dynamically with data
{
    //Step 1: Create 'node-container' element and assign attributes

    var div = document.createElement("div");
    div.setAttribute("id", p.data[node][1].replace(/ /g, "_"));

    //Step 2: Create label for node element, assign attributes

    var label = document.createElement("label");
    label.setAttribute("for", node.replace(/ /g, "_"));
    label.appendChild(document.createTextNode(p.data[node][0]));

    //Step 3: Create 'node' element (i.e. <select>), assign attributes and events

    var select = document.createElement("select");
    select.setAttribute("id", node.replace(/ /g, "_"));
    select.onchange = function ()                                               //OnChange event for the new node created
    {
        //console.log("Selected DDL ID:" + this.id + " | Selected Value: " + p.data[node][this.selectedIndex] + " | Last child ID: " + $("controls").lastChild.id);

        //Reset Zoom level and Search Term variables for map

        p.zoomLevel = p.data[this.id.replace(/_/g, " ")][2];
        p.searchTerm = "";
        p.address = "";

        //Condition 1: If selected DDL is not the last child, then kill all subsequent childs and create next DDL. Else, create next DDL or do nothing  

        if (this.parentNode.id != $("controls").lastChild.id) {
            while (this.parentNode.id != $("controls").lastChild.id) {
                $("controls").removeChild($("controls").lastChild);
            }

            if (p.data[this.value.replace(/_/g, " ")])                          //Create child node if 'node' value exists in dataset
            {
                p.createChildNode(this.value.replace(/_/g, " "));               //Replacing all '_' in ID of the node with ' '
            }
            else if (this.selectedIndex == 0) {
                /* SelectedIndex=0. Map will not update here! */

                //alert("SelectedIndex=0. Map will not update here!");
            }
            else                                                                //If 'node' value does not exist in dataset
            {
                //Create category node by passing 'p.catNodeValue' to p.createChildNode()

                if (this.id != p.catNodeValue) {
                    p.createChildNode(p.catNodeValue.replace(/_/g, " "));
                }
                else {
                    //Populate search term and show category on map

                    p.searchTerm = this.value;

                    p.handleResults();
                }
            }
        }
        else {
            //Condition 2: Check if SelectedValue in DDL exists as a key in dataset. If yes, call createChildNode() for creating next DDL. If no, do nothing

            if (p.data[this.value.replace(/_/g, " ")]) {
                p.createChildNode(this.value.replace(/_/g, " "));
            }
            else {
                //Selected Node is either 'city' for which no value exists, hence create last node. Else, it is last node and handle two cases for it

                //alert(this.value.replace(/_/g, " ") + " - Node does not exist in dataset!");

                if (this.id != p.catNodeValue) {
                    //Call createCategoryNode() function to populate address and create a node of categories

                    p.createChildNode(p.catNodeValue.replace(/_/g, " "));
                }
                else {
                    //Condition for last node. Handle two cases - when selectedIndex!=0 and when selectedIndex=0

                    if (this.selectedIndex != 0) {
                        //Populate search term and show category on map

                        p.searchTerm = this.value;

                        p.handleResults();
                    }
                    else {
                        /* SelectedIndex=0. Map will not update here! */

                        //alert("SelectedIndex=0. Map will not update here!");
                    }
                }

            }
        }

    };

    //Step 4: Create & add sub-nodes (i.e. <options>) to the 'node' element

    if (node != p.catNodeValue)                                                         //If node IS NOT last node i.e. 'category-list'
    {
        p.searchTerm = "";                                                              //Reset search term IF NOT last node

        for (var elem = 3; elem < p.data[node].length; elem++) {
            var option = document.createElement("option");
            option.setAttribute("value", p.data[node][elem].replace(/ /g, "_"));        //Assign value of the node by replacing all ' ' with '_'
            option.appendChild(document.createTextNode(p.data[node][elem]));
            select.appendChild(option);
        }
    }
    else                                                                                //If node IS last node i.e. 'category-list'
    {
        for (var elem1 = 3; elem1 < p.data[node].length; elem1++) {
            for (var elem2 in p.data[node][elem1]) {
                var option = document.createElement("option");
                option.setAttribute("value", p.data[node][elem1][elem2]);
                option.appendChild(document.createTextNode(elem2));
                select.appendChild(option);
            }
        }
    }

    //Step 5: Display Map with updated address. Set the Zoom Level.

    p.handleResults();
    p.zoomLevel = p.data[node][2];

    //Step 6: Add the node (i.e. DDL) to the div and subsequently to 'container'. 

    div.appendChild(label);
    div.appendChild(select);
    $("controls").appendChild(div);

    //Step 7: Animate the last added DIV by calling the 'setAnimationParams()' function

    div.style.position = "relative";
    div.style.top = p.divTopPosition + "px";

    p.animateDIV();
};

Places.prototype.populateAddress = function ()                          //Function to populate address based on current nodes existing
{
    //p.address = "";                                                   //Empty the address variable

    //Step 1: Traverse through node containers and then into nodes to find its value. Append them separated by ', '

    for (i = 0; i < $("controls").childNodes.length; i++) {
        var tempObj = $("controls").childNodes[i].lastChild;

        if ((tempObj) && (tempObj.id != p.catNodeValue))                //Exclude last node i.e. category node in populating address
        {
            p.address = tempObj.value + ", " + p.address;
        }
    }

    //Step 2: Trim the trailing ', ' if present and updated the 'p.address' variable with the address

    var str = p.address.substring(p.address.length - 2, p.address.length);

    if (str == ", ") {
        p.address = p.address.substring(0, p.address.length - 2).replace(/_/g, " ");            //Remove the trailing ',' and replace '_' with ' '
    }

};

Places.prototype.handleResults = function ()                            //handleResults() function to populateAddress, show selected category on map and then show 'Try again?' button
{
    //Step 1: Populate the address in bottom-top approach using the populateAddress() function

    p.populateAddress();

    //alert("Final Address: " + p.address);

    //Step 2: Call Yelp! Maps API to put all markers on Map with commplete address and updated radius

    initMap(p.searchTerm, "", p.address, p.zoomLevel);

    //Step 3: Display 'Try Again' button and 'Tell a Friend about Searching Places?' form

    if (p.searchTerm != "")
    {
        p.createTryAgain();

        if ($("tellafriend-container")) { emptyParentNode("tellafriend-container"); }

        p.createTellAFriendForm();
    }

};

Places.prototype.createTryAgain = function ()                           //Function to create the 'Try Again?' button, assign attributes and events
{
    //Step 1: Create DIV container for the 'Try again button'

    var div = document.createElement("div");
    div.setAttribute("id", "tryagain-container");
    div.setAttribute("class", "align-right");

    //Step 2: Create 'Try again' button, assign attributes and 'onchange' function

    var btn = document.createElement("button");
    btn.setAttribute("id", "tryagain");
    btn.appendChild(document.createTextNode("Try again?"));
    btn.onclick = function () {
        //Call the constructor to destroy and recreate controls from scratch

        Places();
    };

    //Step 3: Append 'Try again?' button in 'controls' container

    div.appendChild(btn);
    $("controls").appendChild(div);
};

Places.prototype.createTellAFriendForm = function ()                    //Function for creating the 'Tell a Friend?' form
{
    var node = "tellafriend_form";

    //Step 1: Create DIV container for the 'Tell a friend' feature

    var maindiv = document.createElement("div");
    maindiv.setAttribute("id", "tellafriend-container");

    //Step 2: Create header, form, assign attributes and 'onsubmit' function for the form

    span = document.createElement("span");
    span.setAttribute("class", "header-message");
    span.appendChild(document.createTextNode("Tell a Friend about Searching Places?"));
    var br1 = document.createElement("br");
    var br2 = document.createElement("br");
    maindiv.appendChild(span);
    maindiv.appendChild(br1);
    maindiv.appendChild(br2);

    var form = document.createElement("form");
    form.setAttribute("name", node);
    form.setAttribute("id", node);
    form.setAttribute("method", "post");
    form.setAttribute("action", "index.html");
    form.onsubmit = function ()
    {
        //Perform form validation, display the error message and empty the node to display success message after storing data

        var fname = trim(this.elements[0].value);
        var email = trim(this.elements[1].value);
        var regex_name = /^[A-Za-z0-9 ]{3,20}$/;
        var regex_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
        var errors = [];
        var errorMsg = "Form validation summary:\n";

        if (!regex_name.test(fname))
        {
            errors[errors.length] = "Full Name field missing or invalid!";
        }
        if (!regex_email.test(email))
        {
            errors[errors.length] = "E-Mail field missing or invalid!";
        }

        if (errors.length > 0)
        {
            for (var i = 0; i < errors.length; i++) {
                errorMsg += "\n" + (i + 1) + ". " + errors[i];
            }

            alert(errorMsg);

            return false;
        }

        //Store values in cookies/local storage using 'handleStorage()' function

        p.handleStorage("set", fname, email);

        //POST to sendMail.php page which will send E-Mail and return with message
        
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function ()
        {
            if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200))                                   //When the AJAX response is received
            {
                //Destroy 'tellafriend-container' container and show success message

                emptyParentNode("tellafriend-container");

                span = document.createElement("span");
                span.setAttribute("class", "header-message");
                span.appendChild(document.createTextNode(xmlhttp.responseText));
                $("tellafriend-container").appendChild(span);
            }
        }

        xmlhttp.open("POST", "./sendMail.php", "true");
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send("full_name=" + fname + "&e_mail=" + email);

        //Return 'false' so page won't redirect
        
        return false;
    };

    //Step 3: Retrieved stored data using 'handleStorage()' function. Create two input controls for Full Name and E-mail.

    getArray = p.handleStorage("get");

    for (var i = 0; i <= 1; i++) 
    {
        var div = document.createElement("div");
        var label = document.createElement("label");
        label.setAttribute("for", p.data[node][i][0]);
        label.appendChild(document.createTextNode(p.data[node][i][1]));
        var input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("name", p.data[node][i][0]);
        input.setAttribute("size", p.data[node][i][2]);
        input.setAttribute("maxlength", p.data[node][i][3]);
        input.setAttribute("value", getArray[i]);
        var br = document.createElement("br");
        br.setAttribute("class", "clearBoth");

        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(br);
        form.appendChild(div);

        var br = document.createElement("br");
        form.appendChild(br);
    }

    //Step 4: Create DIV for Submit and Reset button

    var div = document.createElement("div");
    div.setAttribute("class", "align-right");
    var submit = document.createElement("input");
    submit.setAttribute("type", "submit");
    submit.setAttribute("name", "submit");
    submit.setAttribute("value", p.data[node][2]);
    var reset = document.createElement("input");
    reset.setAttribute("type", "button");
    reset.onclick = function () 
    {
        document.forms[0].elements[0].value = "";
        document.forms[0].elements[1].value = "";

        p.handleStorage("set", "", "");
    };
    reset.setAttribute("value", p.data[node][3]);
    div.appendChild(submit);
    div.appendChild(reset);
    form.appendChild(div);

    //Step 5: Append main div in 'controls' container

    maindiv.appendChild(form);
    $("controls").appendChild(maindiv);
};

Places.prototype.handleStorage = function (operation, fname, email)                 //Function for storing and retrieving values from storage
{
    //Perform 'set' or 'get' operation on storage (localStorage if supported, else cookies)

    var getArray = [];

    if (window.localStorage)                                                        //Check if localStorage is supported in browsers
    {
        if (operation == "set")
        {
            window.localStorage.setItem("fname", fname);
            window.localStorage.setItem("email", email);
        }
        else
        {
            var fname_val = localStorage.getItem("fname");
            var email_val = localStorage.getItem("email");

            getArray[getArray.length] = (fname_val == null) ? "" : fname_val;
            getArray[getArray.length] = (email_val == null) ? "" : email_val;

            return getArray;
        }
    }
    else                                                                            //Else, use Cookies
    {
        if (operation == "set")
        {
            SetCookie("fname", fname);
            SetCookie("email", email);
        }
        else
        {
            var fname_val = GetCookie("fname");
            var email_val = GetCookie("email");

            getArray[getArray.length] = (fname_val == null) ? "" : fname_val;
            getArray[getArray.length] = (email_val == null) ? "" : email_val;

            return getArray;
        }
    }

}

Places.prototype.animateDIV = function ()                                           //Function to animate the last DIV created
{
    //Step 1: Initialize the timer object and last DIV in the 'contents' DIV

    var timerObj;
    var lastDiv = $('controls').lastChild;

    //Step 2: Increase 'top' style attribute by 1px

    lastDiv.style.top = parseInt(lastDiv.style.top) + 5 + "px";

    //Step 3: Check if current 'top' style attribute is multiple of 120. If yes, clear timeout. Else, call the function again recursively using the setTimeout() function

    if ((parseInt(lastDiv.style.top) % 120) == 0) 
    {
        clearTimeout(timerObj);
    }
    else 
    {
        timerObj = setTimeout("p.animateDIV();", 1);
    }
}

Places.prototype.createGeolocationFeature = function ()                             //Function to create the 'I'm Feeling Lucky!' Geolocation feature
{
    //Step 1: Create label for node element, assign attributes

    var label = document.createElement("label");
    label.setAttribute("for", "geo-category");
    label.appendChild(document.createTextNode("Nearby category:"));

    //Step 2: Create "geo-category" Dropdownlist and populate categories in it.

    var select = document.createElement("select");
    select.setAttribute("id", "geo-category");

    for (var elem1 = 3; elem1 < p.data[p.catNodeValue].length; elem1++) 
    {
        for (var elem2 in p.data[p.catNodeValue][elem1]) 
        {
            var option = document.createElement("option");
            option.setAttribute("value", p.data[p.catNodeValue][elem1][elem2]);
            option.appendChild(document.createTextNode(elem2));
            select.appendChild(option);
        }
    }

    //Step 3: Create "geo-search" button and assign 'onchange' event.

    var btn = document.createElement("button");
    btn.setAttribute("id", "geo-search");
    btn.appendChild(document.createTextNode("I'm Feeling Lucky!"));
    btn.onclick = function () 
    {
        if ($("geo-category").selectedIndex == 0) { return; }

        if (navigator.geolocation) 
        {
            navigator.geolocation.getCurrentPosition(function (position) 
            {
                p.locationLatLng = position;
                p.searchTerm = $("geo-category").value;
                p.zoomLevel = 10;

                initMap(p.searchTerm, p.locationLatLng, "", p.zoomLevel);
            });
        }
        else 
        {
            alert("Sorry! Your browser does not support HTML5 Geolocation.");
        }
    };

    //Step 4: Insert all created elements in 'results' DIV before 'top' DIV

    $("geolocation-feature").appendChild(label);
    $("geolocation-feature").appendChild(select);
    $("geolocation-feature").appendChild(btn);
};
