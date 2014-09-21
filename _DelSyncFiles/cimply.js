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
	    	show_cause();
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


function show_cause() {
	// This is the main routine, the backbone logic flow.

	//first make sure all of the draggable/droppable elements are initialized. 
	$(".cause_card").draggable({ revert:true, revertDuration:0, stack:"div"});
	
	$("#donate_zone").droppable({
		drop: function(event, ui) {
			// do something on dropped on this area
			console.log('dropped on donate.')

			},
		tolerance: "touch"
	});
	$("#no_zone").droppable({
		drop: function(event, ui) {
			// do something on dropped on this area
			console.log('dropped on no zone.')
			
			},
		tolerance: "touch"
	});
	$("#top_zone").droppable({
		drop: function(event, ui) {
			// do something on dropped on this area
			console.log('dropped on top zone.')
			},
		tolerance: "touch"
	});
	$("#bottom_zone").droppable({
		drop: function(event, ui) {
			// do something on dropped on this area
			console.log('dropped on bottom zone.')
			},
		tolerance: "touch"
	});


	var currentcauseRef = new Firebase('https://cimply.firebaseio.com/'+window.corp+'/user/'+window.user.id+'/cause_index_location');
	currentcauseRef.once('value', function(snap){
		var loc = snap.val();
		var causenameref = new Firebase('https://cimply.firebaseio.com/'+window.corp+'/causes/corps_causes_index/'+snap.val());
		causenameref.once('value', function(namesnap){
			console.info( namesnap.val() );
			if (namesnap) {
				var causename = namesnap.val();
				console.log('on cause named: '+causename);

				var causeref = new Firebase('https://cimply.firebaseio.com/causes/'+causename);
				causeref.once('value', function(causerefsnap){
					render_cause_card( causerefsnap.val() );
				})
			} else {
				console.log('no name corresponding to that index.');
			}
		})
	})




}




