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
	    var corp = 'GS';
	    cimplyRef.child('user_corp_index/'+user.id).set(corp);

	    //Create a random start location for the user
	    //TO DO 
	    // 

	    //create a user reference under the corporation's list of users.
	    cimplyRef.child(corp+'/user/'+user.id).update({ 
	    	'id' :user.id,
	    	'cause_index_locaton': 1,
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

function render_cause_card(snap) {
	console.log('snap to be rendered');
	console.info( snap );
}


function add_new_cause() {
		//sanitize these b/c they're used in URLs/locations later. 
		var slug = fb_san( $('#name').val() );
		var corp = fb_san( $('#corp').val() );
		console.log('slug: '+slug);

		var URL = $('#URL').val(); //not stored as a firebase location URL
		var display_name = $('#display_name').val();
		var description = $('#description').val();

		//add it to the corporation's list of causes. 
		var corpRef = new Firebase("https://cimply.firebaseio.com/"+corp+"/causes/"+slug);
		corpRef.update({
			'dollars':0,
		})

		var onComplete = function(error) {
		  if (error) {
		    console.log('Synchronization failed');
		  } else {
		    console.log('Synchronization succeeded');
		    $('#msg').html('SUCCESS!');
		    $('input').val('');
		  }
		};

		//update the corporations corpindex (translates numbers to corp slugs) 
		var causesindexRef = new Firebase("https://cimply.firebaseio.com/"+corp+"/causes/corps_causes_index/");
		causesindexRef.once('value', function(snap){
			var total_causes = snap.numChildren();
			var new_cause_number = total_causes+1;
			causesindexRef.child(new_cause_number).set(slug);
		})
		
		//set the global list of causes
		var causeRef = new Firebase("https://cimply.firebaseio.com/causes/"+slug);
		causeRef.update({
			'URL':URL,
			'name': display_name,
			'description':description, 
		}, onComplete)

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
	var result = input.replace('.', ""); //removes chars not accepted by Firebase locations.
	var result = result.replace('#', ""); //removes chars not accepted by Firebase locations.
	var result = result.replace('$', ""); //removes chars not accepted by Firebase locations.
	var result = result.replace('[', ""); //removes chars not accepted by Firebase locations.
	var result = result.replace(']', ""); //removes chars not accepted by Firebase locations.
	return result;
}
