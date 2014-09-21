// Helper functions for Cimply (including some Firebase helper functions)

function show_screen(screen_name) {
	// shows one and hides all of the other views. IDK how to MVC very well so this is my janky workaround
	
	// all of the views are called views.
	hideclass('view');

	switch(screen_name) {
    case 'login':
   		// case: 'login'
       	show('login_screen');
       	$('#wrapper').css({
       		'background-image': 'url(/2.jpg)',
       		'background-repeat': 'no-repeat',
       		'background-size' : 'cover',
       	});

        break;
    case 'main':
    	show('main_screen');
    	$('#wrapper').css({
       		'background-image': 'url(/2_in.png)',
       		'background-repeat': 'no-repeat',
       		'background-size' : 'cover',
       	});
        break;
    case 'more_info':
    	show('more_info_screen');
    	$('#wrapper').css({
       		'background-image': 'url(/2_in.png)',
       		'background-repeat': 'no-repeat',
       		'background-size' : 'cover',
       	});
       
        break;
    default:
         // Default should be login screen, or check login status and redo. 
	}
}

function createNewUser(email, password) {
	var cimplyRef = new Firebase("https://cimply.firebaseio.com/");

	window.auth.createUser(email, password, function(error, user) {
	  if (error === null) {
		
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

function check_local_cache_status() {
	// makes sure all's cached. Does a super basic check - whether there are the same #. See DeepEqual type stuff for more serious array checking. 
	var userRef = new Firebase("https://cimply.firebaseio.com/user_corp_index/"+window.user.id);
	userRef.once('value', function(usersnap){
		var corp = usersnap.val();
		var causesRef = new Firebase("https://cimply.firebaseio.com/"+corp+"/causes");
		causesRef.once('value', function(snap) {
			window.database = snap.numChildren();
		})
	})

	var local = window.allcauses.length;

	if (local === window.database) {
		cache_complete()
	} else {
		// console.log('caching..');
		// console.log('local: '+local+' remote: '+window.database+'.');

		setTimeout(function(){
			check_local_cache_status();
		}, 500);


	}
}


function swipe_mode() {
	show_screen('main');
	check_local_cache_status();
}


function cache_complete() {
	// console.log('local caching finished.');
	//create the card. 

	//if window.offset exceeds the # of causes available, start loop over. 
	if (!window.offset) {
		window.offset = 0;
	}

	//0 index vs. positive integers 
	if (window.offset  >= window.allcauses.length) {
		console.log('reached end, resetting window.offset');
		window.offset = 0;
	}

	render_cause_card(window.allcauses, window.offset | 0);
}

function render_cause_card(localcache, offset) {
	$('#cause_cell').empty();

	var render_this = localcache[offset];
	
	//to be accessible when shit gets dropped. 
	window.current_cause = render_this;

	// console.info(render_this);
	var html = ''
	var html = html+'<div class="cause_card">';
	var html = html+'<span class="cause_name">'+render_this.display_name+'</span>';
		var html = html+'<div class="cause_photo">';
		var html = html+'<img src="'+render_this.URL+'"/>';
		var html = html+'</div>';
	var html = html+'</div>';
	$('#cause_cell').append(html);

	//now make sure all of the draggable/droppable elements are initialized. 
	$(".cause_card").draggable({ revert:true, revertDuration:0, stack:"div", scroll: false});
		
	$("#donate_zone").droppable({
		drop: function(event, ui) {
			// do something on dropped on this area
			console.log('dropped on donate.')
			donate_action();
			},
		tolerance: "touch"
	});
	$("#no_zone").droppable({
		drop: function(event, ui) {
			// do something on dropped on this area
			console.log('dropped on pass zone.')
			pass_action();
			},
		tolerance: "touch"
	});
	$("#top_zone").droppable({
		drop: function(event, ui) {
			// do something on dropped on this area
			console.log('dropped on top zone.')
			more_info_action();
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
}

function donate_action() {
	tally(1);
	check_local_cache_status();
}

function pass_action() {
	tally(0);
	check_local_cache_status();
}

function more_info_action() {
	show_screen('more_info');
	$('#description').html(window.current_cause.description);
	$('#display_name').html(window.current_cause.display_name);
}



function tally(status) {
	//first tally
	var slug = window.current_cause.slug; 

	if (status == 1) {
		var updateRef = new Firebase("https://cimply.firebaseio.com/"+corp+"/causes/"+slug+'/dollars');
		updateRef.transaction(function(current) {
		  return current+1;
		});
	}

	//then update the window.offset 
	window.offset++;

	//update total number of causes this user has seen so far (not this doesn't keep count of WHICH ones, just total #)
	var userseenref =  new Firebase("https://cimply.firebaseio.com/"+corp+"/user/"+window.user.id+"/charities_seen");
	userseenref.transaction(function(current) {
	  return current+1;
	});
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
		var causesindexRef = new Firebase("https://cimply.firebaseio.com/"+corp+"/corps_causes_index/");
		causesindexRef.once('value', function(snap){
			var total_causes = snap.numChildren();
			var new_cause_number = total_causes+1;
			causesindexRef.child(new_cause_number).set(slug);
		})
		
		//set the global list of causes
		var causeRef = new Firebase("https://cimply.firebaseio.com/causes/"+slug);
		causeRef.update({
			'URL':URL,
			'display_name': display_name,
			'description':description,
			'slug':slug, 
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
