$(document).ready(function() {
	$(".hidden").hide();
	$(".open").click(function(){
		$(this).toggleClass('active').next().slideToggle("slow");
		return false;
	});
});

$(document).ready(function(){
              $('#slide').cycle( {
          fx: 'fade',
          speed: 1500,
          timeout:2000,
        } );
          });