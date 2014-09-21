// Cimply Company view. This JS just updates the page in realtime 


$(document).ready(function(){
	var companyRef = new Firebase('https://cimply.firebaseio.com/Lockheed');

	companyRef.on('value', function(snap){
		var text = JSON.stringify(snap.val(), null, 2);
		$('#activity').append('<li>'+text+'</li>');
	})

	var causesRef = new Firebase('https://cimply.firebaseio.com/Lockheed/causes');
	causesRef.on('child_added', function(snap) {
		var cause = snap.name();
		$('#causes_list').append('<li>'+cause+'<span id="'+cause+'total"></span></li>');
	})

	// Update the dollars for each one. 
	causesRef.on('value', function(snap){
		snap.forEach(function(snapshot){
			var total = snapshot.val().dollars;
			var name = snapshot.name();
			$('#'+name+'total').val(total);
		})
	})

	var employeesRef = new Firebase('https://cimply.firebaseio.com/Lockheed/user');
	employeesRef.on('value', function(snap){
		var total = snap.numChildren();
		$('#engaged_employees').text(total);
	})

	var redcrossref = new Firebase('https://cimply.firebaseio.com/Lockheed/causes/redcross/dollars');
	var malarianomoreref = new Firebase('https://cimply.firebaseio.com/Lockheed/causes/malarianomore/dollars');
	var waterorgref = new Firebase('https://cimply.firebaseio.com/Lockheed/causes/waterorg/dollars');
	var wwfdollarsref = new Firebase('https://cimply.firebaseio.com/Lockheed/causes/wwf/dollars');

	redcrossref.on('value', function(snap) {
		$('#redcrossdollars').text(snap.val());
	})

	malarianomoreref.on('value', function(snap) {
		$('#malarianomoredollars').text(snap.val());
	})
	
	waterorgref.on('value', function(snap) {
		$('#waterorgdollars').text(snap.val());
	})
	
	wwfdollarsref.on('value', function(snap) {
		$('#wwfdollars').text(snap.val());
	})

})
