// Cimply Company view. This JS just updates the page in realtime 


$(document).ready(function(){
	var companyRef = new Firebase('https://cimply.firebaseio.com/GS');

	companyRef.on('value', function(snap){
		var text = JSON.stringify(snap.val(), null, 2);
		$('#activity').append('<li>'+text+'</li>');
	})

	var causesRef = new Firebase('https://cimply.firebaseio.com/GS/causes');
	causesRef.on('value', function(snap) {
		snap.forEach(function(causesnap) {
			$('#causes_list').append('<li>'+snap.val().display_name+'<span id="'+cause+'total"></span></li>');
		})
	})

	// Update the dollars for each one. 
	causesRef.on('value', function(snap){
		snap.forEach(function(snapshot){
			var total = snapshot.val().dollars;
			var name = snapshot.val().display_name;
			$('#'+name+'total').val(total);
		})
	})

	var employeesRef = new Firebase('https://cimply.firebaseio.com/GS/user');
	employeesRef.on('value', function(snap){
		var total = snap.numChildren();
		$('#engaged_employees').text(total);
	})

	var redcrossref = new Firebase('https://cimply.firebaseio.com/GS/causes/redcross/dollars');
	var malarianomoreref = new Firebase('https://cimply.firebaseio.com/GS/causes/malarianomore/dollars');
	var waterorgref = new Firebase('https://cimply.firebaseio.com/GS/causes/waterorg/dollars');
	var wwfdollarsref = new Firebase('https://cimply.firebaseio.com/GS/causes/wwf/dollars');

	redcrossref.on('value', function(snap) {
		$('#redcrossdollars').text(snap.val());
		$('#fb_shares_redcross').text(snap.val()*77);
		$('#tw_shares_redcross').text(snap.val()*64);
	})

	malarianomoreref.on('value', function(snap) {
		$('#malarianomoredollars').text(snap.val());
		$('#fb_shares_malarianomore').text(snap.val()*77);
		$('#tw_shares_malarianomore').text(snap.val()*77);
	})
	
	waterorgref.on('value', function(snap) {
		$('#waterorgdollars').text(snap.val());
		$('#fb_shares_waterorg').text(snap.val()*77);
		$('#tw_shares_waterorg').text(snap.val()*77);
	})
	
	wwfdollarsref.on('value', function(snap) {
		$('#wwfdollars').text(snap.val());
		$('#fb_shares_wwf').text(snap.val()*77);
		$('#tw_shares_wwf').text(snap.val()*77);
	})

})
