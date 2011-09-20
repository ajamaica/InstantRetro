var show_per_page = 6; 
var obecnie = 0;
var number_of_pages1 = 0;
var obecnie_klas = '';

$(document).ready(function(){
		
	obecnie_klas = $("ul.select-category li a").eq(0).attr("rel");
	//getting the amount of elements inside content div
	var number_of_items = $('ul.pages-portfolio li.'+obecnie_klas+'').length;
	//calculate the number of pages we are going to have
	var number_of_pages = Math.ceil(number_of_items/show_per_page);
		
	number_of_pages1 = number_of_pages;
	
	//now when we got all we need for the navigation let's make it '
	
	/* 
	what are we going to have in the navigation?
		- link to previous page
		- links to specific pages
		- link to next page
	*/
	var navigation_html = '<ul class="pagination"><li class="cufon-standard standard-size-30">Page:</li>';
	var current_link = 0;
	while(number_of_pages > current_link){
		navigation_html += '<li><a href="javascript:go_to_page(' + current_link +')" class="cufon-standard standard-size-30">'+ (current_link + 1) +'</a></li><li class="cufon-standard standard-size-30">/</li>';
		current_link++;
	}
	navigation_html += '</ul>';
	
	$('.page_navigation').html(navigation_html);
	
	//add active_page class to the first page link
	$('.page_navigation li a:first').addClass('active');
	
	//hide all the elements inside content div
	$('ul.pages-portfolio li').css('display', 'none');
	
	$('ul.select-category li').eq(0).addClass('active');
		
	//and show the first n (show_per_page) elements
	$('ul.pages-portfolio li.'+obecnie_klas+'').slice(0, show_per_page).css('display', 'block');
	
});

$(document).ready(function(){	

// filter choosen elements
$("ul.select-category li").click(function() {

	$("ul.select-category li.active").removeClass("active");
	$(this).addClass("active");
	var element_index = $("ul.select-category li").index(this);
	
	var filterBy = $("ul.select-category li a").eq(element_index).attr("rel");
	
	
	var number_of_items = $('ul.pages-portfolio li.'+filterBy+'').length;
	obecnie_klas = filterBy;
	//calculate the number of pages we are going to have
	number_of_pages1 = Math.ceil(number_of_items/show_per_page);
	
	var navigation_html = '<ul class="pagination"><li class="cufon-standard standard-size-30">Page:</li>';
	var current_link = 0;
	while(number_of_pages1 > current_link){
		navigation_html += '<li><a href="javascript:go_to_page(' + current_link +')" class="cufon-standard standard-size-30">'+ (current_link + 1) +'</a></li><li class="cufon-standard standard-size-30">/</li>';
		current_link++;
	}
	navigation_html += '</ul>';
	
	$('.page_navigation').html(navigation_html);
	
	//add active_page class to the first page link
	$('.page_navigation li a:first').addClass('active');
	
	//hide all the elements inside content div
	$('ul.pages-portfolio li').css('display', 'none');
		
	//and show the first n (show_per_page) elements
	$('ul.pages-portfolio li.'+filterBy+'').slice(0, show_per_page).css('display', 'block');
	go_to_page(0);

	return false;
	
});
});

function go_to_page(page_num){
		
	//get the number of items shown per page
			
	obecnie = page_num;
	
	//get the element number where to start the slice from
	start_from = page_num * show_per_page;
	
	//get the element number where to end the slice
	end_on = start_from + show_per_page;
	//hide all children elements of content div, get specific items and show them
	$("ul.pages-portfolio").hide().fadeIn(400);
	$('ul.pages-portfolio li.'+obecnie_klas+'').css('display', 'none').slice(start_from, end_on).css('display', 'block');
	
	$('.page_navigation li a').removeClass('active');
	$('.page_navigation li a').eq(obecnie).addClass('active');
	
Cufon.refresh();

}