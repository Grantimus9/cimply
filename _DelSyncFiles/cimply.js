// Cimply Main JS cimply.js


$(document).ready(function(){
	// Check Login/Auth Status 
	var cimplyRef = new Firebase("https://cimply.firebaseio.com/");
	window.auth = new FirebaseSimpleLogin(cimplyRef, function(error, user) {
	  if (error) {
	    // an error occurred while attempting login
	    console.log(error);
	  } else if (user) {
	    // user authenticated with Firebase
	    // console.log("User ID: " + user.uid + ", Provider: " + user.provider);
	    window.user = user;
	    show_screen('main');
	    
	    // App-specific login issues
			// set corporation name (who the employee works for) globally to be easily accessible
			var userRef = new Firebase("https://cimply.firebaseio.com/user_corp_index/"+user.id);
			userRef.once('value', function(snap) {
				window.corp = snap.val();
				//get the location where the person left off last 
				
				var causeRef = new Firebase("https://cimply.firebaseio.com/"+snap.val()+"/user/"+user.id+"/cause_index_location");
				causeRef.once('value', function(snapshot) {
					window.cause_start_location = snapshot.val();
				})
			})

	    //Run main routine
	    var mode = 'swipe';
	    if (mode == 'swipe') {
	    	cache();
	    }
		

	  } else {
	    // user is logged out
	    show_screen('login');
	  }
	});


	//LOGIN SCREEN
	//Create User 
	$(document).on('click', '#sign_up_button', function() {
			createNewUser($('#email').val(), $('#password').val());
		}
	);

	$(document).on('click', '#login_button', function() {
			LoginUser($('#email').val(), $('#password').val());
		}
	);

	// Main Screen
	$(document).on('click', '#bottom_right_btn', function() {
			logout();
		}
	);

	//Adding a New Cause Page functions 
	$(document).on('click', '#add_new_cause_btn', function() {
			add_new_cause();
		}
	);

}) //end of docready. 


function cache() {
	//get each cause this company allows and cache it locally
	window.allcauses = [];
	var userRef = new Firebase("https://cimply.firebaseio.com/user_corp_index/"+window.user.id);
	userRef.once('value', function(usersnap){
		var corp = usersnap.val();
		var causesRef = new Firebase("https://cimply.firebaseio.com/"+corp+"/causes");
		causesRef.once('value', function(snap) {
			snap.forEach(function(causesnap){
				var cause = causesnap.name(); 
				var causedataref = new Firebase("https://cimply.firebaseio.com/causes/"+cause);
				causedataref.once('value', function(causedatasnap){
					if (causedatasnap.val() !== null) {
						window.allcauses.push(causedatasnap.val());
					}
				})
			})
		})
	})
	check_local_cache_status();
}




