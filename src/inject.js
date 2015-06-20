// This script is run when visiting Verizon's tvlisting.aspx

chrome.runtime.sendMessage({}, function(response) {
  var settings = response;
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      // find the server name for your DVR
      var serverName = ""
      var tags = document.getElementsByTagName('script'),
        i;
      var regex = /.*ServerName.?=.?'?([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+).*\'/;
      for (var i in tags) {
        var match = regex.exec(tags[i].innerText);
        if (match) {
          serverName = match[1];
        }
      }
      if (serverName == "") {
        alert("Error: 'serverName' not found in page. Tomato Stand extension needs to be updated by the developer");
        return;
      }

      // inject setting values
      var s = document.createElement('script');
      s.text = "SN=\"" + serverName + "\"\n" +
        "days=" + settings.days + "\n" +
        "channellist=[" + settings.channels + "]\n";
      (document.head || document.documentElement).appendChild(s);

      // inject our code to run in same context
      s = document.createElement('script');
      s.src = chrome.extension.getURL('src/script.js');
      s.onload = function() {
        this.parentNode.removeChild(this);
      };
      (document.head || document.documentElement).appendChild(s);

      // if the page requests a RT search, pass the message to the background
      window.addEventListener('message', function(event) {
        if (event.source != window)
          return;

        if (event.data.type && (event.data.type == "FROM_TS_PAGE")) {
          // pass window messages up to the background page
          chrome.runtime.sendMessage({
            type: "FROM_TS_PAGE",
            movie: event.data.movie,
            year: event.data.year,
            cast: event.data.cast
          });
        }
      });
    }
  }, 10, settings);
});

// send RT results from the background page to the script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // pass chrome message to the page
  window.postMessage({
    type: message.type,
    score: message.score,
    posterURI: message.posterURI,
    isAudience: message.isAudience,
    url: message.url
  }, '*');
});