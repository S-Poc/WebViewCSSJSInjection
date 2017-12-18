var no_function =function(){};

var after_login_success_rediect='';
var redirect_login=function(){
	if(after_login_success_rediect!=''){
		window.location.href=after_login_success_rediect;
	}
};
var eventData = {};
var success_login_callback={
	succesCallBack:no_function
};

function onSignIn(googleUser) {
	var id_token = googleUser.getAuthResponse().id_token;
	if (id_token) {
		googleUser.disconnect();
		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: '/auth/google/callback',
			data: {
				'id_token': id_token,
				'route': window.location.pathname
			},
			success: function(res) {
				if (EventsManager && typeof EventsManager != 'undefined' && EventsManager.hasOwnProperty('dispatchEvent') && typeof EventsManager.dispatchEvent === 'function') {
					EventsManager.dispatchEvent(EventsManager.events.LOGGED_IN, res);
				}
				closeLoginPopUp();
			},
			error: function() {
				console.log("Failure in Google SignIn");
			},
			complete: function() {
				googleUser.disconnect();
			}
		});
	} else {
		console.log('There was an error, token not received');
	}
}

function open_login(success_callback, eData){
	$('#login-drawer').show();
    $('#login-drawer').addClass('in');
    $('body').addClass('overflow-h');
    $('.menuBox').removeClass('go-show');
    $('.loginBox.current-wrap').removeClass('current-wrap').addClass('next-wrap');
    $('#validateBox').addClass('current-wrap').removeClass('next-wrap').removeClass('prev-wrap');
    if(success_callback){
    	success_login_callback.succesCallBack=success_callback;
    }
    if(eData && typeof eData == 'object'){
    	eventData = eData;
    }
}

function open_login_redirect(success_redirect, eData){
	$('#login-drawer').show();
    $('#login-drawer').addClass('in');
    $('body').addClass('overflow-h');
    $('.menuBox').removeClass('go-show');
    $('.loginBox.current-wrap').removeClass('current-wrap').addClass('next-wrap');
    $('#validateBox').addClass('current-wrap').removeClass('next-wrap').removeClass('prev-wrap');
    if(success_redirect){
    	after_login_success_rediect=success_redirect;
    	success_login_callback.succesCallBack=redirect_login;
    }else{
    	after_login_success_rediect=window.location.href;
    	success_login_callback.succesCallBack=redirect_login;
    }
    if(eData && typeof eData == 'object'){
    	eventData = eData;
    }
}


function login(divid, passId, errorId) {
	var inputype = document.getElementById("input").value;
	var password = document.getElementById(passId).value;
	if (password.trim() == '') {
		loader_ajax_hide();
		var elemId = "#" + errorId;
		$(elemId).html("Password can not be blank!!");
	} else {
		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: "/new-login",
			data: {
				"username": inputype,
				"password": password
			},
			success: (function(res) {
				loader_ajax_hide();
				if (res.status == false) {
					var error = res.error_msg;
					var elemId = "#" + errorId;
					$(elemId).html(error);
					document.getElementById(passId).className = "invalid form-control";
				} else {
					if ('ontouchstart' in window) {
						var restdata = res;
						$.ajax({
							type: 'POST',
							dataType: 'json',
							url: '/ajaxPage',
							data: {},
							success: (function(ress) {
								if (EventsManager && typeof EventsManager != 'undefined' && EventsManager.hasOwnProperty('dispatchEvent') && typeof EventsManager.dispatchEvent === 'function') {
									if (eventData && !eventData.hasOwnProperty("userDetails")) {
										eventData.userDetails = res;
										console.log("ontouchstart", restdata);
									}
									EventsManager.dispatchEvent(EventsManager.events.LOGGED_IN, eventData);
								}
								$('#' + divid).find('.clse').click();
								success_login_callback.succesCallBack();
							})
						});
					} else {
						console.log("else ontouchstart", res);
						if (EventsManager && typeof EventsManager != 'undefined' && EventsManager.hasOwnProperty('dispatchEvent') && typeof EventsManager.dispatchEvent === 'function') {
							if (eventData && !eventData.hasOwnProperty("userDetails")) {
								eventData.userDetails = res;
							}
							EventsManager.dispatchEvent(EventsManager.events.LOGGED_IN, eventData);
						}
						$('#login-drawer').removeClass('in');
						$('body').removeClass('overflow-h');
						$('.menuBox').addClass('go-show');
						success_login_callback.succesCallBack();
					}
				}
			})
		});
	}
}
function resset_password(){
	var password=document.getElementById('resset_password').value;
	var confirm_password=document.getElementById('resset_comfirm_password').value;
	var otp_id=document.getElementById('resset_otp_id').value;
	var otp=document.getElementById('resset_otp').value;

	$.ajax({
		type: 'POST',
		dataType:'json',
		url: '/reset_password',
		data: { "new_password": password,"confirm_password":confirm_password,"otp_id": otp_id,"otp":otp},
		success: (function (res) {
			loader_ajax_hide();	
			if(res.status==false){	
			 	var error=res.error_msg;
		     	$("#resset_error").html(error);
			}else{
				var msg=res.output_params.data.msg;
				showWrap($('#validateBox'));
			 	hideWrap($('#ressetBox'));
			 	$("#resset_Text").html(msg);
			}
		})
	});
}


function signup(){
	var name=document.getElementById('sign_name').value;
	var email=document.getElementById('sign_email').value;
	var phone=document.getElementById('sign_phone').value;
	var password=document.getElementById('sign_password').value;
	var confirm_password=document.getElementById('sign_comfirm_password').value;
	$.ajax({
		type: 'POST',
		dataType:'json',
		url: '/user_signup',
		data: { "name": name,"email":email,"phone": phone,"password":password,"confirm_password":confirm_password},
		success: (function (res) {
			loader_ajax_hide();	
			if(res.status==false){	
			 	var error=res.error_msg;
		     	$("#sign_errormsg").html(error);
			}else{
				var msg=res.output_params.data.msg;
				var phone=res.output_params.data.phone;
				var type=res.output_params.data.type;
				var email=res.output_params.data.email;
				var sign_otp_id=res.output_params.data.otp_id
				var success_msg=res.output_params.success_msg;
				if(type=='login' && phone=='' && email!=''){
				 	hideWrap($('#signupBox'));
				 	showWrap($('#validateBox'));
				 	document.getElementById('input').value=email;
				 	$("#resset_Text").html(success_msg);
			    }else if(type=='login' && phone!='' && email==''){
				 	hideWrap($('#signupBox'));
				 	showWrap($('#validateBox'));
				 	document.getElementById('input').value=phone;
				 	$("#resset_Text").html(success_msg);
			 	}else{
					showWrap($('#otp_verify'));
				 	hideWrap($('#signupBox'));
				 	countdown_signup(0,30);
				 	$("#Phone_sign_Text").html(phone);
				 	$("#otp_sign_msg").html(msg);	
				 	document.getElementById("sign_otp_id").value =	sign_otp_id;
				 	document.getElementById("globalInput").value = phone;	
			 	}					
			}
		})
	});
}


function validate_login(){
	var input=document.getElementById("input").value;
	document.getElementById("globalInput").value = input;
	$("#login_errormsg").html('');
	$.ajax({
		type: 'POST',
		dataType:'json',
		url: '/validate_user_account',
		data: { "input": input},
		success: (function (res) {
			loader_ajax_hide();
			if(res.status==false){	 
				var error=res.error_msg;
		     	$("#login_errormsg").html(error);	
		 	}else{
				var type=res.output_params.data.type;
				var phone=res.output_params.data.phone;
				var email=res.output_params.data.email;
			 	if(type=='login' && phone=='' && email!=''){
				 	hideWrap($('#validateBox'));
				 	showWrap($('#login_email_screen'));
				 	$("#emailText").html(email);
			 	}
			 	if(type=='login' && email=='' && phone!=''){
				 	hideWrap($('#validateBox'));
				 	showWrap($('#login_phone_screen'));
			 	}
			 	if(type=='create_account'){
				 	hideWrap($('#validateBox'));
				 	showWrap($('#signupBox'));
				 	$('#sign_email').prop("readonly", false);
				 	$('#sign_email').prop("readonly", false);
				 	if(email!=''){
				 		document.getElementById("sign_email").value=email;
				 		$('#sign_email').prop("readonly", true);
				    }
				    if(phone!=''){
					    document.getElementById("sign_phone").value=phone;
					    $('#sign_phone').prop("readonly", true);
				    }
			 	}
			}
		})
	});
}

function hideWrap(obj){
	$(obj).removeClass('current-wrap').removeClass('next-wrap').addClass('prev-wrap');
}

function showWrap(obj){
	$(obj).removeClass('prev-wrap').removeClass('next-wrap').addClass('current-wrap');
}

function addValueInText(obj, type, showTimer, timerFunction){
	var inputData=document.getElementById('globalInput').value;
	$(obj).html(inputData);
	document.getElementById("otp_l").value='';
	$.ajax({
		type: 'POST',
		dataType:'json',
		url: '/send_otp_to_diner',
		data: {'input': inputData,'type':type},
		success: (function (res) {
            loader_ajax_hide();
			if(res.status==true){
				if(type=='login'){
				 	document.getElementById("otp_id").value =	res.output_params.data.otp_id;
				 	$("#otperrormsg").html(res.output_params.data.msg);
				}
				if(type=='signup'){
				 	document.getElementById("sign_otp_id").value =	res.output_params.data.otp_id;
				 	$("#otp_sign_msg").html(res.output_params.data.msg);
				}
				if(type=='reset_password'){ 
					hideWrap($('#login_email_screen'));
					hideWrap($('#login_phone_screen'));
			 	    showWrap($('#ressetBox'));
				    document.getElementById("resset_otp_id").value =res.output_params.data.otp_id;
				    $("#otp_sign_msg").html(res.output_params.data.msg);
				}
				if (showTimer && typeof timerFunction == 'function'){
					timerFunction(0, 30);
				}
			} else {
				var error = (res.error_msg === undefined) ? 'Some Error in Sending OTP' : res.error_msg;
				if(type=='login'){
			     	$("#otperrormsg").html(error);
				}	
			}
		})
	});
}


function otp_verify(obj){
	$("#otp_sign_msg").removeClass("error_msg");

	if(obj=='login_via_otp_screen'){
		var otp=document.getElementById("otp_l").value;
		var otp_id=document.getElementById("otp_id").value;
    }
    if(obj=='otp_verify'){
    	var otp=document.getElementById("verification_code").value;
	    var otp_id=document.getElementById("sign_otp_id").value;
    }
    
   	if (otp.trim()==''){
    	if (obj=='login_via_otp_screen'){
    		loader_ajax_hide();
    	    $("#otperrormsg").html("OTP can not be blank!!");
    	}
    	if (obj=='otp_verify'){
    	    loader_ajax_hide();
            $("#otp_sign_msg").html("OTP can not be blank!!");
 			$("#otp_sign_msg").addClass("error_msg");
    	}
    } else if (!otp_id){
    	loader_ajax_hide();
    } else {
		$.ajax({
			type: 'POST',
			dataType:'json',
			url: '/otp-login',
			data: {'otp_id':otp_id,'otp':otp},
			success: (function (res) {
				var resdata=res;
				loader_ajax_hide();
				if(res.status==false){	
				 	var error=res.error_msg;
				 	if(obj=='otp_verify'){
				 		$("#otp_sign_msg").html(error);
			 			$("#otp_sign_msg").addClass("error_msg");
				 	}
					if(obj=='login_via_otp_screen'){
			     		$("#otperrormsg").html(error);
				 	}								
				}else{
					$.ajax({
						type: 'POST',
						dataType:'json',
						url: '/ajaxPage',
						data: {},
						success: (function (ress) {
							if(EventsManager && typeof EventsManager != 'undefined' && EventsManager.hasOwnProperty('dispatchEvent') && typeof EventsManager.dispatchEvent === 'function'){
								if(eventData && !eventData.hasOwnProperty("userDetails")){
									eventData.userDetails = resdata;
								}
								EventsManager.dispatchEvent(EventsManager.events.LOGGED_IN, eventData);
							}
							//$("#header").html($(ress).html());
							$('#login_via_otp_screen').find('.clse').click();
							success_login_callback.succesCallBack(); 
					  	})

					  
					});
				}
			})
		});
	}
}
function countdown(minutes, seconds) {
    var time = minutes*60 + seconds;
    var interval = setInterval(function() {
        var el = $('span.js-countdown-span');
        if($('#countdown_data').hasClass('hide')){
        	$('#countdown_data').removeClass('hide');
        	$('#resend-otp').addClass('hide');
        }
        if(time == 0) {
        	clearInterval(interval);
        	$('#countdown_data').addClass('hide');
        	$('#resend-otp').removeClass('hide');            
            return;
        }
        var minutes = Math.floor( time / 60 );
        if (minutes < 10) minutes = "0" + minutes;
        var seconds = time % 60;
        if (seconds < 10) seconds = "0" + seconds; 
        var text = minutes + ':' + seconds;
        el.html(text);
        time--;
    }, 1000);
}
function loader_ajax(id){
	$('#login-drawer .loading').removeClass('hide');
}
function loader_ajax_hide(){
	$('#login-drawer .loading').addClass('hide');
}
function countdown_signup(minutes, seconds) {
    var time = minutes*60 + seconds;
    var interval = setInterval(function() {
        var el = $('span.js-countdownsignup-span');
     	if($('#countdown_signupdata').hasClass('hide')){
        	$('#countdown_signupdata').removeClass('hide');
        	$('#verify-otp').addClass('hide');
        }
        
        if(time == 0) {
        	clearInterval(interval);
        	$('#countdown_signupdata').addClass('hide');
        	$('#verify-otp').removeClass('hide');            
            return;
        }
        var minutes = Math.floor( time / 60 );
        if (minutes < 10) minutes = "0" + minutes;
        var seconds = time % 60;
        if (seconds < 10) seconds = "0" + seconds; 
        var text = minutes + ':' + seconds;
        el.html(text);
        time--;
    }, 1000);
}

$("body").on('keyup', "#input", function(e){
	var code = (e.keyCode ? e.keyCode : e.which);
   	if (code == 13) {
       $('#userNameBtn').click();
       return true;
   	}
});

$("body").on('keyup', "#phonepassword", function(e){
	var code = (e.keyCode ? e.keyCode : e.which);
   	if (code == 13) {
       $('#loginBtn').click();
       return true;
   	}
});

$("body").on('keyup', "#emailpassword", function(e){
	var code = (e.keyCode ? e.keyCode : e.which);
   	if (code == 13) {
       $('#emailPasswordBtn').click();
       return true;
   	}
});

function closeLoginPopUp(){
	$('#login-drawer').removeClass('in');
	$('body').removeClass('overflow-h');
}


