
    var config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: "http",
          host: "160.250.167.126",
          port: parseInt(33606),
        },
        bypassList: ["localhost"]
      }
    };

    chrome.proxy.settings.set({value: config, scope: "regular"}, function() {});
    function callbackFn(details) {
      return {
        authCredentials: {
          username: "2970md2970mdkhr24237253",
          password: "khr2423722"
        }
      };
    }

    chrome.webRequest.onAuthRequired.addListener(
      callbackFn,
      {urls: ["<all_urls>"]},
      ["blocking"]
    );
  