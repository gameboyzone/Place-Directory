<?php
	
	if(isset($_POST["full_name"]) && isset($_POST["e_mail"]))
	{	
		$to = $_POST["e_mail"];
		$subject = "Your friend has suggested you to try Searching Places";
		$message = 
"Hello " . $_POST['full_name'] . ",
A friend of yours has suggested you to try Searching Places! Searching Places helps you to search for categories like " . 
"Restaurants, Bars, Medical centers, Beach Places, Party Venues, etc at a particular location or where you currently are.
										
Check out here - http://people.rit.edu/hds6825/736/projects/project1/
					
					
Thank you.";
		
		$headers = "From: Searching Places <hds6825@rit.edu>" . "\r\n";
		mail($to,$subject,$message,$headers);
		
		echo("Your request has been received.");
	}
	else
	{
		header("Location: ./index.html");	
	}
?> 