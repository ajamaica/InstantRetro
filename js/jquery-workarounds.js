Cufon.replace('.cufon-standard', {hover:true, fontFamily: 'Savia Shadow' });
Cufon.replace('.cufon-sketch', { fontFamily: 'Sketch Block' });

function show(id, eq) {
	
	if(eq > -1) { 
	
		$(id).eq(eq).show("slice");
	
	} else {
			
		$(id).show("slice");
	
	}

}

function hide(id, eq) {

	if(eq > -1) {

		$(id).eq(eq).hide("slice");
	
	} else {
	
		$(id).hide("slice");
	
	}

}


$(document).ready(function () {

/* IMG torn */
$(".torn").prepend("<div class='torn-top'></div><div class='torn-left'></div><div class='torn-right'></div><div class='torn-bottom'></div>");
$(".rame").prepend("<div class='rame-top'></div><div class='rame-left'></div><div class='rame-right'></div><div class='rame-bottom'></div>");
$(".rame-img").prepend("<div class='rame-top'></div><div class='rame-left'></div><div class='rame-right'></div><div class='rame-bottom'></div>");
$(".rame-type-two").prepend("<div class='rame-type-two-top'></div><div class='rame-type-two-left'></div><div class='rame-type-two-right'></div><div class='rame-type-two-bottom'></div>");
$(".torn-type-two").prepend("<div class='torn-type-two-top'></div><div class='torn-type-two-left'></div><div class='torn-type-two-right'></div><div class='torn-type-two-bottom'></div>");
$(".rame-type-three").prepend("<div class='rame-type-three-top'></div><div class='rame-type-three-left'></div><div class='rame-type-three-right'></div><div class='rame-type-three-bottom'></div>");

$('.torn-type-two').each(function(index) {
	var widthtorn = $(".torn-type-two img").eq(index).width();
	var heighttorn = $(".torn-type-two img").eq(index).height();
	$(".torn-type-two .torn-type-two-top").eq(index).css("width", widthtorn);
	$(".torn-type-two .torn-type-two-bottom").eq(index).css("width", widthtorn).css("margin-top", (heighttorn-3));
	$(".torn-type-two .torn-type-two-left").eq(index).css("height", (heighttorn-9));
	$(".torn-type-two .torn-type-two-right").eq(index).css("height", (heighttorn-9)).css("margin-left", (widthtorn-4));
});

$('.rame-type-two').each(function(index) {
	var widthtorn = $(".rame-type-two img").eq(index).width();
	var heighttorn = $(".rame-type-two img").eq(index).height();
	$(".rame-type-two .rame-type-two-top").eq(index).css("width", widthtorn);
	$(".rame-type-two .rame-type-two-bottom").eq(index).css("width", widthtorn).css("margin-top", (heighttorn-7));
	$(".rame-type-two .rame-type-two-left").eq(index).css("height", (heighttorn-19));
	$(".rame-type-two .rame-type-two-right").eq(index).css("height", (heighttorn-19)).css("margin-left", (widthtorn-15));
});

$('.torn').each(function(index) {
	var widthtorn = $(".torn").eq(index).width();
	var heighttorn = $(".torn").eq(index).height();
	$(".torn .torn-top").eq(index).css("width", widthtorn);
	$(".torn .torn-bottom").eq(index).css("width", widthtorn).css("margin-top", (heighttorn-5));
	$(".torn .torn-left").eq(index).css("height", (heighttorn-8));
	$(".torn .torn-right").eq(index).css("height", (heighttorn-8)).css("margin-left", (widthtorn-2));
});

$('.rame').each(function(index) {
	var widthtorn = $(".rame").eq(index).width();
	var heighttorn = $(".rame").eq(index).height();
	$(".rame .rame-top").eq(index).css("width", widthtorn);
	$(".rame .rame-bottom").eq(index).css("width", widthtorn).css("margin-top", (heighttorn-10));
	$(".rame .rame-left").eq(index).css("height", (heighttorn-10));
	$(".rame .rame-right").eq(index).css("height", (heighttorn-13)).css("margin-left", (widthtorn-2));
});

$('.rame-img').each(function(index) {
	var widthtorn = $(".rame-img img").eq(index).width();
	var heighttorn = $(".rame-img img").eq(index).height();
	$(".rame-img .rame-top").eq(index).css("width", widthtorn);
	$(".rame-img .rame-bottom").eq(index).css("width", widthtorn+3).css("margin-top", (heighttorn-10));
	$(".rame-img .rame-left").eq(index).css("height", (heighttorn-10));
	$(".rame-img .rame-right").eq(index).css("height", (heighttorn-13)).css("margin-left", (widthtorn-2));
});

$('.rame-type-three').each(function(index) {
	var widthtorn = $(".rame-type-three img").eq(index).width();
	var heighttorn = $(".rame-type-three img").eq(index).height();
	$(".rame-type-three .rame-type-three-top").eq(index).css("width", widthtorn);
	$(".rame-type-three .rame-type-three-bottom").eq(index).css("width", widthtorn+3).css("margin-top", (heighttorn-10));
	$(".rame-type-three .rame-type-three-left").eq(index).css("height", (heighttorn-10));
	$(".rame-type-three .rame-type-three-right").eq(index).css("height", (heighttorn-10)).css("margin-left", (widthtorn-8));
});

$('.not-a').click(function() {
	return false;
});

$(".padding-text-cloud").css("display", "none");
$(".padding-text-cloud").eq(0).css("display", "block");

// Portfolio single pagination

$("div#portfolio-single-img div.rame-type-three").css("display", "none");
$("div#portfolio-single-img div.rame-type-three").eq(0).css("display", "block");
$("#portfolio-single-pagination li a").eq(0).addClass('active');

$("#portfolio-single-pagination li a").click(function() {
	
	var element_index = $("#portfolio-single-pagination li a").index(this);
	$("div#portfolio-single-img div.rame-type-three").hide('slice');
	$("div#portfolio-single-img div.rame-type-three").eq(element_index).show('slice');
	$("#portfolio-single-pagination li a").removeClass('active');
	$("#portfolio-single-pagination li a").eq(element_index).addClass('active');
	
	Cufon.refresh();
	
});

// Opinion

var active = 0;
var allopinion = $("ul.list-opinion li").length;
$("ul.list-opinion li").css("display", "none");
$("ul.list-opinion li").eq(0).css("display", "block");

$("a.opinion-prev").click(function() {

	if(allopinion>1) {
	
		if(active-1 >= 0) {
		
			active--;
			$("ul.list-opinion li").hide("slice");
			$("ul.list-opinion li").eq(active).show("slice");
		
		} else {
			
			active = allopinion-1;
			$("ul.list-opinion li").hide("slice");
			$("ul.list-opinion li").eq(active).show("slice");
			
		}
	
	}

});

$("a.opinion-next").click(function() {

	if(allopinion>1) {
	
		if(active+1 < allopinion) {
		
			active++;
			$("ul.list-opinion li").hide("slice");
			$("ul.list-opinion li").eq(active).show("slice");
		
		} else {
			
			active = 0;
			$("ul.list-opinion li").hide("slice");
			$("ul.list-opinion li").eq(active).show("slice");
			
		}
	
	}

});

// Opinion content

var active_1 = 0;
var allopinion_1 = $("ul.list-content-opinion li").length;
$("ul.list-content-opinion li").css("display", "none");
$("ul.list-content-opinion li").eq(0).css("display", "block");
$("ul.list-content-opinion-author li").css("display", "none");
$("ul.list-content-opinion-author li").eq(0).css("display", "block");

$("a.content-opinion-prev").click(function() {

	if(allopinion_1>1) {
	
		if(active_1-1 >= 0) {
		
			active_1--;
			$("ul.list-content-opinion-author li").css("display", "none");
			$("ul.list-content-opinion-author li").eq(active_1).css("display", "block");
			$("ul.list-content-opinion li").hide("slice");
			$("ul.list-content-opinion li").eq(active_1).show("slice");
		
		} else {
			
			active_1 = allopinion_1-1;
			$("ul.list-content-opinion-author li").css("display", "none");
			$("ul.list-content-opinion-author li").eq(active_1).css("display", "block");
			$("ul.list-content-opinion li").hide("slice");
			$("ul.list-content-opinion li").eq(active_1).show("slice");
			
		}
	
	}

});

$("a.content-opinion-next").click(function() {

	if(allopinion_1>1) {
	
		if(active_1+1 < allopinion_1) {
		
			active_1++;
			$("ul.list-content-opinion-author li").css("display", "none");
			$("ul.list-content-opinion-author li").eq(active_1).css("display", "block");
			$("ul.list-content-opinion li").hide("slice");
			$("ul.list-content-opinion li").eq(active_1).show("slice");
		
		} else {
			
			active_1 = 0;
			$("ul.list-content-opinion-author li").css("display", "none");
			$("ul.list-content-opinion-author li").eq(active_1).css("display", "block");
			$("ul.list-content-opinion li").hide("slice");
			$("ul.list-content-opinion li").eq(active_1).show("slice");
			
		}
	
	}

});
/* top menu */
$("#header div#navigation > ul > li").mouseover(function(){
	$(this).find(".sub").css("display", "block");
}).mouseleave(function(){
	$(this).find(".sub").css("display", "none");	
});
// end 

$(".input-submit").mouseover(function(){
	var element_index = $(".input-submit").index(this);
	$(".input-text").eq(element_index).addClass("input-text-active");
}).mouseleave(function(){
	$(".input-text").removeClass("input-text-active");
});

/* autoclear function for inputs */
$('.autoclear').click(function() {
if (this.value == this.defaultValue) {
this.value = '';
}
});

$('.autoclear').blur(function() {
if (this.value == '') {
this.value = this.defaultValue;
}
});

});