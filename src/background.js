// This is run in the backgrond 

// default settings
var settings = new Store("settings", {
  "days": '7',
  "channels": '375, 376, 377, 378, 379, 380, 385, 386, 390, 391, 550, 551, 552, 640, 690, 695, 746, 865, 866, 867, 868, 869, 870, 873, 885, 887, 899, 901, 902, 903, 904, 905, 906, 907, 908, 909, 910, 911'
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.type) {
    case 'FROM_TS_PAGE':
      $.ajax({
        url: 'http://www.rottentomatoes.com/search/?search=' + message.movie,
        success: parseRTResults(message.movie, message.year, message.cast, 'http://www.rottentomatoes.com/search/?search=' + message.movie, sender.tab.id),
        error: function(request, status, error) {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'FROM_TS_EXTENSION' + movie,
            score: -1,
            posterURI: "",
            isAudience: 0,
            url: 'http://www.rottentomatoes.com/search/?search=' + message.movie
          });
        }
      });
      break;
    default:
      chrome.pageAction.show(sender.tab.id);
      sendResponse(settings.toObject());
  }
});

// when installed show the options page first
chrome.runtime.onInstalled.addListener(
  function(details) {
    if (details.reason == "install") {
      chrome.tabs.create({
        url: "src/options/index.html"
      });
    }
  }
);

// change ":contains" selector to be case insensitive
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {
  return function(elem) {
    return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
  };
});

// parse RT search results
function parseRTResults(movie, year, cast, url, tabid) {
  return function(data, textStatus, jqXHR) {
    // find the first movie result that matches the correct year
    firstResult = $("ul#movie_results_ul span.movie_year:contains(" + year + ")", data).parents("li");
    if ((!firstResult || firstResult.length < 1) && cast && cast.length > 4) {
      actors = cast.split(",");
      for (i in actors) {
        firstResult = $("ul#movie_results_ul a[href*='celebrity']:contains('" + actors[i].trim() + "')", data).parents("li");
        if (firstResult && firstResult.length > 0) {
          break
        }
      }
    }
    if (firstResult && firstResult.length > 0) {
      scoretag = firstResult.find("span.tMeterScore");
      if (scoretag && scoretag.length > 0) {
        score = scoretag.text().replace(/%.*/, '');
        posterURI = firstResult.find("span.movieposter img").attr("src");
        chrome.tabs.sendMessage(tabid, {
          type: 'FROM_TS_EXTENSION' + movie,
          score: score,
          posterURI: posterURI,
          isAudience: 0,
          url: url
        });
      } else {
        // no score found on the first result, try on the page itself
        pagelink = firstResult.find("a.articleLink").attr("href");
        if (pagelink) {
          $.ajax({
            url: 'http://www.rottentomatoes.com' + pagelink,
            success: parseRTPage(movie, year, cast, 'http://www.rottentomatoes.com' + pagelink, tabid),
            error: function(request, status, error) {
              chrome.tabs.sendMessage(sender.tab.id, {
                type: 'FROM_TS_EXTENSION' + movie,
                score: -1,
                posterURI: "",
                isAudience: 0,
                url: url
              });
            }
          });
        } else {
          // not found
          chrome.tabs.sendMessage(tabid, {
            type: 'FROM_TS_EXTENSION' + movie,
            score: -1,
            posterURI: "",
            isAudience: 0,
            url: url
          });
        }
      }
    } else {
      // no results found, maybe we're on the actual movie page
      func = parseRTPage(movie, year, cast, url, tabid);
      func(data, textStatus, jqXHR);
    }
  };
};

// parse the RT movie page
function parseRTPage(movie, year, cast, url, tabid) {
  return function(data, textStatus, jqXHR) {
    isAudience = 0;
    score = -1;
    scoretag = $("div#all-critics-numbers span.meter-value span", data);

    if (scoretag && scoretag.length > 0) {
      score = scoretag.text().replace(/%.*/, '');
      // no critics score found, fall back to audience score
    } else {
      scoretag = $("div.audience-score span.meter-value span", data);
      isAudience = 1;
      if (scoretag) {
        score = scoretag.text().replace(/%.*/, '')
      } else {
        score = -1;
      }
    }
    posterURI = $("div.col-xs-7 img", data).attr("src");
    chrome.tabs.sendMessage(tabid, {
      type: 'FROM_TS_EXTENSION' + movie,
      score: score,
      posterURI: posterURI,
      isAudience: isAudience,
      url: url
    });
  }
}