//Conenct to the server
var server_name = "http://localhost:3000/";
var socket = io.connect(server_name);
//Counters to maintain statistics at the client side
var loveCounter,loveCounter,showTweet = true;;
//On receiving the tweet from the server invoke the handler
socket.on("tweet", function(data) {
	//Get love counter
	loveCounter = data.loveCounter;
	//Get hate counter
	hateCounter = data.hateCounter;
	//Calcuate the love and hate percentage to precision of 2 decimal points 
	var lovePer = (loveCounter/ (loveCounter + hateCounter)) *100;
	var hatePer = 100 - lovePer;
	//Append the results to the cooresponding DOM elements
	$("#loveStat").text(lovePer.toFixed(2) +"%");
	$("#hateStat").text(hatePer.toFixed(2) +"%");
	$("#totalStat").text(loveCounter + hateCounter);
	var message =  data.user +":" +data.text;
	//If the stop showing tweets button is not clicked then show the live tweet feed
	if(showTweet == true) {
		appendTextToTextArea(data.currentState,message);
	}
});

//Method which displays the live tweet feed on love/hate blocks
function appendTextToTextArea(state, message){
	//If tweet is for love ,display on the love block.We add to the beggining of the blcok
	if(state.indexOf("love") >= 0) {
		$("#love").prepend("<li class='list-group-item list-group-item-info'>" +message + "</li>");
		return;
	}
	//If tweet is for hate ,display on the love block.We add to the beggining of the blcok
	if(state.indexOf("hate") >= 0) {
		$("#hate").prepend("<li class='list-group-item list-group-item-danger'>" + message + "</li>");
		return;
	}
}
//When stop showing/start showing button is clicked we invoke this handler
$( "#stop" ).click(function() {
	//If tweet feed has to be stopped make the global flag false and chage the message
	if ($( "#stop" ).val()=="Click Here To Stop Displaying Tweets") {
		$( "#stop" ).val("Click Here To Start Displaying Tweets");
		$( "#stop" ).attr("class", "btn btn-success btn-sm");
		showTweet = false;
	} else {
		//make flag as true to show twitter feed
		$( "#stop" ).val("Click Here To Stop Displaying Tweets");
		$( "#stop" ).attr("class", "btn btn-danger btn-sm");
		showTweet = true;
	}
});