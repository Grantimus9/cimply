// Helper functions for Cimply (including some Firebase helper functions)

function show_screen(screen_name) {
	// shows one and hides all of the other views. IDK how to MVC very well so this is my janky workaround
	
	// all of the views are called views.
	hideclass('view');

	switch(screen_name) {
    case 'login':
   		// case: 'login'
       	show('login_screen');
        break;
    case 'main':
    	show('main_screen');
        break;
    case 'cause_info_screen':
    	show('cause_info_screen');
       
        break;
    default:
         // Default should be login screen, or check login status and redo. 
	}
}

function createNewUser(email, password) {
	var cimplyRef = new Firebase("https://cimply.firebaseio.com/");

	window.auth.createUser(email, password, function(error, user) {
	  if (error === null) {
	    console.log("User created successfully:", user);
		
		//set the uid-corp index (denormalized data is weird) so we can look up the user's corporation later. 
		// for now the corp is Lockheed
	    var corp = 'Lockheed';
	    cimplyRef.child('user_corp_index/'+user.id).set(corp);

	    //Create a random start location for the user
	    //TO DO 
	    // 


	    //create a user reference under the corporation's list of users.
	    cimplyRef.child(corp+'/user/'+user.id).update({ 
	    	'id' :user.id,
	    	'cause_index_locaton': 0,
	    })

	    LoginUser(email, password);
	    show('main_screen');

	  } else {
	    console.log("Error creating user:", error);
	  }
	});
}

function LoginUser(email, password) {	
	  window.auth.login('password', {
		  	email: email,
		  	password: password,
		  	rememberMe: false
		});
}

function logout() {
	window.auth.logout();
	show('login');
}

function removeUser(email, password) {
	//for now just delete Grant's account
	var email = 'Grant.dchs@gmail.com';
	var password = 'grant';

	window.auth.removeUser(email, password, function(error) {
	  if (error === null) {
	    console.log("User removed successfully");
	    logout();
	    show('login');
	  } else {
	    console.log("Error removing user:", error);
	  }
	});
}

// 
// 
// THE KEY FUNCTIONS 
// 
// 
// 

function get_cause() {
	//cause_index under each corp. holds each cause the corp supports indexed so given a random number you can get the cause name. 

	var corp_causes = new Firebase("https://cimply.firebaseio.com/"+window.corp+"/causes");
	corp_causes.on('value', function(snap) {
		var total = snap.numChildren();
	})




}



function add_new_cause() {
	if (slug) {
		//sanitize these b/c they're used in URLs/locations later. 
		var slug = fb_san($('#name').val());
		var corp = fb_san($('#corp').val());

		var URL = $('#URL').val(); //not stored as a firebase location URL
		var display_name = $('#display_name').val();
		var description = $('#description').val();

		// console.log(slug, URL, display_name, corp, description);

		var onComplete = function(error) {
		  if (error) {
		    console.log('Synchronization failed');
		  } else {
		    $('#msg').html("SUCCESS!");
		    $('input').val('');
		  }
		};

		//add it to the corporation's list of causes. 
		var corpRef = new Firebase("https://cimply.firebaseio.com/"+corp+"/causes/"+slug);
		console.info(corpRef);
		corpRef.update({
			'dollars':0,
		})

		//update the corporations corpindex (translates numbers to corp slugs) 
		var causesindexRef = new Firebase("https://cimply.firebaseio.com/"+corp+"/causes/corps_causes_index");
		console.info(corpRef);
		causesindexRef.on('value', function(snap) {
			if (snap) {
				var total = snap.numChildren()+1;
				causesindexRef.set({
					total : corp,
				})
			} else { 
				//it's the first time/blank
				causesindexRef.set({
					total : 0,
				})
			}
		})

		

		//set the global list of causes
		var causeRef = new Firebase("https://cimply.firebaseio.com/Causes/"+slug);
		console.info(corpRef);
		causeRef.update({
			'URL':URL,
			'name': display_name,
			'description':description, 

		}, onComplete)


	}
}


function hide(div_id) {
	$('#'+div_id).css('display', 'none');
}

function hideclass(classname) {
	$('.'+classname).css('display', 'none');
}

function show (div_id) {
	// This might be wrong/inefficient
	$('#'+div_id).css('display', 'inline');
}

function escapeEmail(email) {
    return (email || '').replace('.', ',');
}

function unescapeEmail(email) {
    return (email || '').replace(',', '.');
}

function fb_san(input) {
	return input.replace(/.|#|$|[|]/g, ""); //removes chars not accepted by Firebase locations.
}
