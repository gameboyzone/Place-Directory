//-----------------------------------------------------------------//
//------- JavaScript Utility file for JavaScript Projects ---------//
//-----------Author: Hardik Shah ----- Course: 4004-736 -----------//
//-----------------------------------------------------------------//


//Function for returning node based on ID passed 

function $(id)
{
    return document.getElementById(id);

    //This 'id' is local argument. 'window.id' is the global variable
}

//Function for returning node based on Tag name and index in the page

function $$(tag, index)
{
    return document.getElementsByTagName(tag)[index];
}

//Function for returning an array of nodes based on a class-name
//Procured from Internet. Has not been used in Project

function $$$(classname) 
{
    var nodeArray = [];
    var temp = document.getElementsByTagName("*");
    var regex = new RegExp("(^|\s)" + classname + "(\s|$)");
    for (var i = 0; i < temp.length; i++) 
    {
        if(regex.test(temp[i].className)) 
        {
            nodeArray.push(temp[i]);
        }
    }
    
    return nodeArray;
}

//Function for returning string trimmed with white-spaces

function trim(str)
{
    while (str.substring(0, 1) == ' ') // check for white spaces from beginning
    {str = str.substring(1, str.length);}

    while (str.substring(str.length - 1, str.length) == ' ') // check white space from end
    {str = str.substring(0, str.length - 1);}
    
    return str;
}

//Function for finding first node in a JSON object 

function firstNodeInJSON(jsonObj)
{
    for (node in jsonObj) { return node };
}

//Function for finding last node in a JSON object 

function lastNodeInJSON(jsonObj)
{
    for (node in jsonObj) { };
    return node;
}

//Function for emptying all the child nodes in the node passed

function emptyParentNode(id)
{
    nodeObj = $(id);

    while (nodeObj.firstChild)
    {
        nodeObj.removeChild($(id).firstChild);
    }
}

//Function to check FORK OUT 'non-modern' browsers and 'IE 5 on Mac'

function checkBrowser() 
{

    if (document.getElementById && document.attachEvent)                       		//Modern IE browser (IE 5+)
    {
        
    }
    if (document.getElementById)                                               		//Modern non-IE browser
    {
        //var userAgentString = "Mozilla/4.0 (compatible; MSIE 5.0; Mac_PowerPC)";
        
        var userAgentString = navigator.userAgent;
        var macStatus = userAgentString.toLowerCase().indexOf("mac") > -1;
        var macIEversion = parseInt(userAgentString.substr(userAgentString.indexOf("MSIE ") + ("MSIE ").length, 3));
		
        if (macStatus && (macIEversion == 5))                                       //Check for IE 5 on Mac
        {
            alert("ALERT! Your browser does not support the minimum functionality requirements for this application. \nYou are now being redirected to download Mozilla Firefox.");
            
            window.location="http://www.mozilla.org/en-US/firefox/new/";
        }
    }
    else                                                                            //Very old browsers, warn them and redirect to download a latest browser
    {
        alert("ALERT! Your browser does not support the minimum functionality requirements for this application. \nYou are now being redirected to download Mozilla Firefox.");

        windows.location = "http://www.GetFirefox.com/";
    }

}