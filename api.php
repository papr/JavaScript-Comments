<?php

/* ---------------------------------------------------------------- [Settings] */

$jsonDatabaseFile = '72F887F9-7D09-43CC-ADD4-576D34960C2F.database';

/* Should be changed by you */

$adminUserName = "demo";
$adminUserPassword = "demo"; /* Comparing will be made with md5 */

for($tIndex = 0; $tIndex < 5; ++$tIndex) {
	$adminUserName = md5($adminUserName);
	$adminUserPassword = md5($adminUserPassword);
}

$encryptedUsername = $adminUserName;
$encryptedPassword = $adminUserPassword;

/* ---------------------------------------------------------------- [Classes] */

class Comments {
	var $items;
	
	function addComment($comment) {
		array_push($this->items, $comment);
	}
	
	function allComments($databaseFile){
		if (is_readable($databaseFile)) {
			if (!$handle = fopen($databaseFile, 'r')) {
				echo "Cannot open file ($jsonfile)";
				exit;
			}
			$this->items = json_decode(fread($handle, filesize($databaseFile)));
			if(count($this->items) < 1) {
				$this->items = array();
			}	
		}
	}
}

class Comment {
	
	var $name;
	var $email;
	var $text;
	var $creationDate;
	var $url;
	var $id;
	var $IP;
	
	function createComment($cName, $cEmail, $cText, $cURL, $cIP) {
		$this->name = $cName;
		$this->email = $cEmail;
		$this->text = $cText;
		$this->creationDate = time() * 1000;
		$this->id = uniqid();
		$this->url = $cURL;
		$this->IP = $cIP;
	}
}

function cmp( $a, $b ) { 
  if(  $a->creationDate ==  $b->creationDate ){ return 0 ; } 
  return ($a->creationDate < $b->creationDate) ? -1 : 1;
} 


/* ---------------------------------------------------------------- [Functions] */


if($_GET['action'] == "auth") {
	if(	$_POST['adminUsername'] == $encryptedUsername && 
		$_POST['adminPassword'] == $encryptedPassword) {
		/* header("HTTP/1.0 200 All Right"); */
		echo("All Right");
	} else {
		/* header("HTTP/1.0 401 Unauthorized"); */ // If sent Javascript will do anything...
		echo("Error: Unauthorized.");
	}
}


if (is_writable($jsonDatabaseFile) && is_readable($jsonDatabaseFile)) {
	if (!$handle = fopen($jsonDatabaseFile, 'a+')) {
		echo "Cannot open file ($jsonDatabaseFile)";
		exit;
	}
	
	$comments = new Comments;
	$comments->allComments($jsonDatabaseFile);
	
	if($_GET['action'] == "save" && $_POST['id'] == "E73BF175-F920-447D-993D-CE4169F17BCD") {
		$postedComment = new Comment;
		$postedComment->createComment($_POST['commentatorName'], $_POST['commentatorEmail'], $_POST['commentatorText'], $_POST['commentatorWebsite'], $_SERVER['REMOTE_ADDR']);
		if(!is_null($postedComment)) {
			$comments->addComment($postedComment);
			echo(json_encode($postedComment));
		} else {
			echo("Error: Comment could not be saved.");
		}
	} else if ($_GET['action'] == "save" && $_POST['id'] != "E73BF175-F920-447D-993D-CE4169F17BCD"){
		echo("Error: Unauthorized.");
	}

	if($_GET['action'] == "remove") {
		if(	$_POST['adminUsername'] == $encryptedUsername && 
			$_POST['adminPassword'] == $encryptedPassword) {
			$postid = $_GET['id'];
			if($postid == "") {
				echo("Error: No ID sent or it is empty.");
			} else {
				for($i = 0; $i < count($comments->items); ++$i) {
					if($comments->items[$i]->id == $postid) {
						unset($comments->items[$i]);
						echo($postid);
					}
				}
			}
		} else {
			header("HTTP/1.0 401 Unauthorized");
			echo("Error: Unauthorized.");
		}
	}	

	usort($comments->items,'cmp');
	
	if (!$handle = fopen($jsonDatabaseFile, 'w+')) {
		echo "Cannot open file ($jsonDatabaseFile)";
		exit;
	}

	$json = json_encode($comments->items);
	if (fwrite($handle, $json) === FALSE) {
        echo "Cannot write to file ($jsonDatabaseFile)";
        exit;
	}
	fclose($handle);
	
	if($_GET['action'] == "getDB") {
		if($_GET['showMails'] == "TRUE") {
			if(	$_POST['adminUsername'] == $encryptedUsername && 
				$_POST['adminPassword'] == $encryptedPassword) {
				echo (json_encode($comments->items));
			} else {
				header("HTTP/1.0 401 Unauthorized");
				echo("Error: Unauthorized.");
			}
		} else {
			$itemsWithoutMail = array();
			foreach($comments->items as &$item) {
				$item->email = md5($item->email);
				$item->IP = md5(md5($item->IP));
				array_push(&$itemsWithoutMail, &$item);
			}
			echo (json_encode($itemsWithoutMail));
		}
	}

}  else {
    echo "The file $jsonDatabaseFile is not writable/readable";
}


if( $_GET['action'] != "auth" &&
    $_GET['action'] != "remove" &&
    $_GET['action'] != "save" &&
    $_GET['action'] != "getDB") {
    header("Location:api-doc.html");
}

?>