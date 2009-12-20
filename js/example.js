$(document).ready(function() {
	showProgress(true);
	$.getJSON("api.php?action=getDB", function(json){
		$.each(json, function(i,item){
			$('#commentWrapper').append(jsonToHTML(item));
        });
        showProgress(false);
	});
	
	$("#item_send").click(function () {
		
		showProgress(true);
		
		/* reset */
		$("#item_name").css("background", "#DDD");
		$("#item_email").css("background", "#DDD");
		$("#item_comment").css("background", "#DDD");
		$(".alert").css("visibility", "hidden");

	
		var name = document.getElementById("item_name").value;
		var mail = document.getElementById("item_email").value;
		var text = document.getElementById("item_comment").value;
		var url = document.getElementById("item_site").value;
		var tempID = document.getElementById("tempID").value;
		
		var shouldSendRequest = true;
		var mailCheck = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
		var fieldAlertBGColor = "#ffa3a7";
		
		if(name == ""){
			$("#item_name").css("background", fieldAlertBGColor);
			shouldSendRequest = false;
		}
		
		if(mail == "" || !mail.match(mailCheck)){
			$("#item_email").css("background", fieldAlertBGColor);
			shouldSendRequest = false;
		}
		if(text == ""){
			$("#item_comment").css("background", fieldAlertBGColor);
			shouldSendRequest = false;
		}
		if(url != "") {
			var i = url.indexOf('http://');
			if(i == -1 || i != 0) {
				url = 'http://'+url;
			}
		}
		
		if(shouldSendRequest) {
			$.post("api.php?action=save",
				{ 	"commentatorName": name,
					"commentatorEmail": mail,
					"commentatorText": text,
					"commentatorWebsite": url,
					"id": tempID
					},
	  			function(data){
	  				var jsonData = new Object();
	  				jsonData = json_parse(data, function(key, value){return value;});
	    			var newComment = jsonToHTML(jsonData);
	    			var commentSelector = "#id_"+jsonData.id;
	    			$('#commentWrapper').append(newComment);
	    			$(commentSelector).css({
	    				"opacity": 0
	    			});
	    			$(commentSelector).animate({
	    				"opacity": 1
	    			}, 1000);
	  		});
			document.getElementById("item_name").value = "";
			document.getElementById("item_email").value = "";
			document.getElementById("item_comment").value = "";
			document.getElementById("item_site").value = "";
  		} else {
  			$(".alert").css("visibility", "visible");
  		}
  		showProgress(false);
    });
});

function jsonToHTML(jsonObj) {
	var html = new String();
	var date = new Date(jsonObj.creationDate);
	var dateString = date.getDate()+'.'+date.getMonth()+'.'+date.getFullYear()+' at '+date.getHours()+':'+date.getMinutes();
	
	var url = jsonObj.url;
	var aTag = new String();
	if(url == "") {
		aTag = jsonObj.name;
	} else {
		aTag = '<a href="'+url+'">'+jsonObj.name+'</a>';
	}
	
	html = '<div class="comment_body" id="id_'+jsonObj.id+'">\
				<div class="gravatar"><img alt="Gravatar" src="http://www.gravatar.com/avatar/'+jsonObj.email+'?s=50&d=identicon" /></div>\
				<div class="comment_meta">\
					<div class="date">'+dateString+'</div>\
					<div class="name">from <p>'+aTag+'</p></div>\
					<div class="text">'+jsonObj.text+'</div>\
				</div>\
			</div>';
	return html;
};

function showProgress(flag) {
	if(flag == true) {
		$('#progress').css("visibility", "visible");
	} else if (flag == false) {
		$('#progress').css("visibility", "hidden");
	}
};