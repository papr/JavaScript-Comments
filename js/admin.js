function init(){
	showProgress(false);
};

function login() {
	showProgress(true);
	var username = document.getElementById("lockUserName").value;
	var password = document.getElementById("lockPassword").value;
	for(var tIndex = 0; tIndex < 5; ++tIndex) {
		username = hex_md5(username);
		password = hex_md5(password);
	}
	var cryptUN = username;
	var cryptPW = password;
	
	window.tmpLogin = new Object();
	window.tmpLogin.uname = cryptUN;
	window.tmpLogin.pword = cryptPW;
	
	$.post("api.php?action=auth",
		{ 	"adminUsername": window.tmpLogin.uname,
			"adminPassword": window.tmpLogin.pword
		},
		function(data){
			if(data.indexOf("All Right") != -1) {
				var wrapper = $('#wrapper');
				wrapper.empty();
				wrapper.append('<div id="management"><div id="content"><a href="" id="logout">Logout</a><img alt="progress" src="img/progress.gif" id="progress" /><h1>Comment Management</h1><div id="comments"></div></div></div>');
				$('#progress').css({"bottom":0,"top":"10px", "right":"60px"});
				loadComments();	
			} else {
				showProgress(false);
				showAlert(true);
			}
	});
};

function logout(){
	window.tmpLogin.uname = "";
	window.tmpLogin.pword = "";
};

function loadComments(){
	$.post("api.php?action=getDB&showMails=TRUE",
		{ 	"adminUsername": window.tmpLogin.uname,
			"adminPassword": window.tmpLogin.pword
		},
		function(data){
			var jsonData = json_parse(data, function(key, value){return value;});
			$.each(jsonData, function(i,item){
				$('#comments').append(jsonToHTML(item));
        	});
        	showProgress(false);
        $('.remove').click(function(){
			var sure = confirm("Are you sure that you want to delete this comment?");
			if(sure) {
				showProgress(true);
				var parent = this.parentElement.parentElement.parentElement;
				var id = $(parent).attr("id");
				id = id.substring(3, id.lenght);
				$.post(("api.php?action=remove&id="+id),
					{ 	"adminUsername": window.tmpLogin.uname,
						"adminPassword": window.tmpLogin.pword
					},
					function(data){
						var shouldDelete = data.indexOf("Error:");
						if(shouldDelete > 0 || shouldDelete == -1) {
							var toRmv = "#id_"+data;
							$(toRmv).animate({
								"opacity":0,
								"height": "0px"
							}, "fast", function(){
								$(toRmv).remove();
								showProgress(false);
							});
						} else if(shouldDelete == 0) {
							window.reload();
						}
		        	});
			};
		});
	});	
};

function showProgress(flag){
	if(flag == true) {
		$('#progress').css("visibility", "visible");
	} else if(flag == false) {
		$('#progress').css("visibility", "hidden");
	}
};

function showAlert(flag){
	if(flag == true) {
		$('.alert').css({
			"visibility": "visible",
			"display": "block"
		});
	} else if(flag == false) {
		$('.alert').css({
			"visibility": "hidden",
			"display": "none"
		});
	}
};

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
	
	var defaultImg = escape("http://media.prietz.org/UserIcon.png");
	
	html = '<div class="item" id="id_'+jsonObj.id+'">\
				<div class="comment_meta">\
					<div class="utilities">\
						<div class="remove"></div>\
					</div>\
					<div class="floats">\
						<div class="date">'+dateString+'</div>\
						<div class="name">from <p>'+aTag+'</p></div>\
						<div class="name">Email: <a href="mailto:'+jsonObj.email+'">'+jsonObj.email+'</a></div>\
						<div class="name">IP: '+jsonObj.IP+'</div>\
					</div>\
					<div class="text">'+jsonObj.text+'</div>\
					<div class="id">id_'+jsonObj.id+'</div>\
				</div>\
			</div>';
	return html;
};