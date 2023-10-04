const origins = [
    "https://www.ebay.com",
    "https://stags.bluekai.com",
    "https://signin.ebay.com",
    "https://c.paypal.com",
    "https://accounts.ebay.com",
    "https://www.google.com"
  ];
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractData') {
      // Extract cookies
      chrome.cookies.getAll({}, function(allCookies) {
        const cookiesData = allCookies.map(cookie => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expirationDate,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: "Lax"
        }));
  
        // Extract local storage
        const originsDataPromises = origins.map(origin => new Promise(async resolve => {
          let queryOptions = { active: true, lastFocusedWindow: true };
          // `tab` will either be a `tabs.Tab` instance or `undefined`.
          let [tab] = await chrome.tabs.query(queryOptions);
          chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: getLocalStorageData,
            args: [origin]
          }, results => {
            resolve({
              origin,
              localStorage: results[0].result
            });
          });
        }));
  
        Promise.all(originsDataPromises).then(originsData => {
          const resultData = {
            cookies: cookiesData,
            origins: originsData
          };
  
          // Download the resulting data
          sendToPopup(resultData);
        });
      });
    }
  });
  
  function getLocalStorageData(origin) {
    const localStorageData = [];
    const currentLocalStorage = window.localStorage;
    for (let i = 0; i < currentLocalStorage.length; i++) {
      const key = currentLocalStorage.key(i);
      const value = currentLocalStorage.getItem(key);
      localStorageData.push({name: key, value});
    }
    return localStorageData;
  }
  
  function sendToPopup(data) {
    const jsonData = JSON.stringify(data, null, 2);

    chrome.runtime.sendMessage({
        action: 'displayData',
        data: jsonData
    });
}
  