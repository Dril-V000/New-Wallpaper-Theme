chrome.runtime.onInstalled.addListener(function() {
	chrome.tabs.create({ url: "newtab.html"});
});
const PAGE = chrome.runtime.getURL("newtab.html");
const isOperaStart = (url) => /^(chrome|opera):\/\/(startpage|newtab|speeddial)/i.test(url || "");

chrome.tabs.onCreated.addListener((tab) => {
    if (isOperaStart(tab.pendingUrl || tab.url)) chrome.tabs.update(tab.id, { url: PAGE });
});

chrome.tabs.onUpdated.addListener((id, info, tab) => {
    if (isOperaStart(info.url || tab.url)) chrome.tabs.update(id, { url: PAGE });
});