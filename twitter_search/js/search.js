$(document).ready(function() {

	// Twitter credentials
	var consumer_key = 'WSYfWEGXfyHzjbA4PFpGmg';
	var consumer_secret = 'CS6hDWqWDW4PBafv2Du8fro3VvhXu3IAxC7FW0pj8';
	var access_token = '1918491818-jqfuNaZdfS14fz9VxwBjDHjLbcG70i3hPNzVMQ7';
	var access_token_secret = 'y1sOBxA0pYDH4SNrgTTzSvh8DuRrjEQthasWeCdNwYs';

	var client = new Codebird;
	client.setConsumerKey(consumer_key, consumer_secret);
	client.setToken(access_token, access_token_secret);

	var current_search;
	var last_10_searches = [];
	var next_tweet_id;
	var enable_more_btn = true;

	// Submit search query
	$('#search-form').submit(function(e) {
		e.preventDefault();
		var search_text = $('#search-input').val();
		if(search_text) {
			search(search_text);
		}
	});

	// Toggle more information on tweets
	$('body').on('click', '.toggle', function() {
		var $this = $(this);

		if($this.hasClass('off')) {
			$this.removeClass('off').addClass('on').html('Show Less &#9650;');
		} else {
			$this.removeClass('on').addClass('off').html('Show More &#9660;')
		}

		var tweetID = $this.parent().attr('id');
		$('#tweet-extra-' + tweetID).slideToggle(300);

		// Border on bottom of darker area
		var $left_box = $('#' + tweetID).find('.tweet-left');
		if($left_box.hasClass('bot-border')) {
			setTimeout(function() {
				$left_box.removeClass('bot-border');
			}, 225);
		} else {
			setTimeout(function() {
				$left_box.addClass('bot-border');
			}, 75);
		}
	});

	// Click on previous searches
	$('body').on('click', '.search-link', function(e) {
		e.preventDefault();
		var search_text = $(this).text();
		search(search_text);
	});

	// Click on Show More Tweets button
	$('body').on('click', '#show-more', function() {
		showMore();
	});

	// Main search + populate tweets function
	function search(text) {

		// Disable search + links until finished loading
		$('#search-form input').prop('disabled', true);
		$('#previous-searches').hide();
		$('#show-more').hide();

		// Clear intro + current results + show loading animation
		$('#welcome').remove();
		$('#assn-info').remove();
		$('#no-results').empty();
		$('#results-area').empty();
		$('#loading').append('<img id="loading-img" src="images/loading.gif">');

		// Update last 10 search queries + current search
		if(last_10_searches.length < 10) {
			last_10_searches.push(text);
		} else {
			last_10_searches.shift();
			last_10_searches.push(text);
		}
		$('#previous-searches').html('<i>Recent Searches:</i> ');
		last_10_searches.forEach(function(search) {
			$('#previous-searches').append('<a class="search-link" href="#">' + search + '</a> ');
		});
		current_search = text;

		// Make request to Twitter API
		client.__call(
			'search_tweets',
			{ q: text, count: 50 },
			function(reply) {
				$('#loading').empty();
				if(reply.statuses.length == 0) {
					$('#no-results').append('<br>There were no results matching your query.');
					$('#show-more').hide();
					enable_more_btn = false;
				} else {

					// Populate tweets
					reply.statuses.forEach(function(status) {
						$('#results-area').append(
							'<div class="tweet" id="'+ status.id +'"><div class="tweet-left"><img class="avatar" src="'+ status.user.profile_image_url +'"><br><a target="_blank" href="http://twitter.com/account/redirect_by_id?id='+ status.user.id +'">'+ status.user.screen_name +'</a></div><div class="tweet-right">'+ status.text +'<div class="tweet-extra" id="tweet-extra-'+ status.id +'"><hr><b>Date posted:</b> '+ status.created_at +'<br><b>Link:</b> <a target="_blank" href="http://www.twitter.com/'+ status.user.screen_name + '/status/' + status.id_str + '">http://www.twitter.com/'+ status.user.screen_name + '/status/' + status.id_str +'</a><br><b>Favorited:</b> '+ status.favorite_count +' times<br><b>Retweeted:</b> '+ status.retweet_count +' times</div></div><div class="clear"></div><div class="toggle off"> Show More &#9660;</div></div>'
						);

						// Keep track of where we are (for showing more tweets)
						next_tweet_id = status.id_str;
					});
				}

				// Re-enable search and links
				$('#search-form input').prop('disabled', false);
				$('#search-input').val(text).focus();
				$('#previous-searches').show();
				
				if(enable_more_btn) {
					$('#show-more').show();
				} else {
					enable_more_btn = true;
				}
			}
		);
	}

	// Show more tweets function
	function showMore() {

		// Disable search + links until finished loading
		$('#search-form input').prop('disabled', true);
		$('#previous-searches').hide();
		$('#show-more').hide();
		$('#loading').append('<img id="loading-img" src="images/loading.gif">');

		// For scrolling to new tweets + hacky fix (see below)
		var offset = $('#loading').offset();
		var $last_tweet = $('#results-area').children().last();

		// Make request to Twitter API
		client.__call(
			'search_tweets',
			{ q: current_search, count: 11, max_id: next_tweet_id },
			function(reply) {
				$('#loading').empty();

				// Populate new tweets
				reply.statuses.forEach(function(status) {
					$('#results-area').append(
						'<div class="tweet" id="'+ status.id +'"><div class="tweet-left"><img class="avatar" src="'+ status.user.profile_image_url +'"><br><a target="_blank" href="http://twitter.com/account/redirect_by_id?id='+ status.user.id +'">'+ status.user.screen_name +'</a></div><div class="tweet-right">'+ status.text +'<div class="tweet-extra" id="tweet-extra-'+ status.id +'"><hr><b>Date posted:</b> '+ status.created_at +'<br><b>Link:</b> <a target="_blank" href="http://www.twitter.com/'+ status.user.screen_name + '/status/' + status.id_str + '">http://www.twitter.com/'+ status.user.screen_name + '/status/' + status.id_str +'</a><br><b>Favorited:</b> '+ status.favorite_count +' times<br><b>Retweeted:</b> '+ status.retweet_count +' times</div></div><div class="clear"></div><div class="toggle off"> Show More &#9660;</div></div>'
					);

					// Keep track of where we are (for showing more tweets)
					next_tweet_id = status.id_str;
				});

				// Re-enable search and links + scroll to new tweets
				$('#search-form input').prop('disabled', false);
				$('#search-input').focus();
				$('#previous-searches').show();
				$('#show-more').show();
				$last_tweet.remove(); // Hacky fix to remove overlapping tweet
				scroll(0,offset.top);
			}
		);
	}
});