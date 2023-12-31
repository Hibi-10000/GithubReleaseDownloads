// ==UserScript==
// @name         Github Release Downloads
// @version      0.1.0
// @description  Show download count for releases on Github
// @icon         https://github.githubassets.com/favicons/favicon-dark.png
// @grant        none
// @author       Hibi_10000
// @source       https://github.com/Hibi-10000/GithubReleaseDownloads
// @match        github.com/*
// @updateURL    https://github.com/Hibi-10000/GithubReleaseDownloads/releases/latest/download/GithubReleaseDownloads.user.js
// @downloadURL  https://github.com/Hibi-10000/GithubReleaseDownloads/releases/latest/download/GithubReleaseDownloads.user.js
// ==/UserScript==

let observer = new MutationObserver(observerFunc)
const setObs = () => {
    const body = document.querySelector("body");
    if(body) {
        observer.observe(body, {childList: true, subtree: true});
    }
    else {
        window.setTimeout(setObs, 1000);
    }
}

function observerFunc() {
    if (new RegExp('https?://github.com/[^/_]*/[^/]*/releases.*').test(document.URL)) run();
}

const setStyle = () => {
    if (document.querySelector('#grdstyle')) return;
    const style = document.createElement('style');
    const css = `
div.Box > div.Box-footer > div.mb-3 > details > div > div > ul > li > div > span.flex-auto {
  flex: none !important;
}
`;
    const textnode = document.createTextNode(css);
    style.appendChild(textnode);
    style.type = 'text/css'
    style.id = 'grdstyle';
    document.querySelector('head').appendChild(style);
}

//大部分がaddshore/browser-github-release-downloads(MIT License)のコード
function run() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        switch (xmlHttp.readyState) {
            case 0: // UNINITIALIZED
            case 1: // LOADING
            case 2: // LOADED
            case 3: // INTERACTIVE
                break;
            case 4: // COMPLETED
                var releases = JSON.parse(xmlHttp.responseText);
                var downloadMap = [];
                for (var i in releases) {
                    for (var j in releases[i].assets) {
                        // browser_download_url is a full URL to the resource
                        downloadMap[decodeURI(releases[i].assets[j].browser_download_url)] = releases[i].assets[j].download_count;
                    }
                }
                var els = document.getElementsByTagName('a');
                //var locale = getLocale();
                for (var ii = 0, l = els.length; ii < l; ii++) {
                    var el = els[ii];
                    if (el.href in downloadMap) {
                        var sizeContainer = el.parentNode.parentNode.children[1];
                        if (!sizeContainer) {
                            console.log("No size parent element selectable to attached download count to");
                            continue;
                        }
                        //そこにgrdcounterがあるかどうか確認する
                        const grdcounter = sizeContainer.querySelector('.grdcounter');
                        if (grdcounter != null) continue;

                        var size = sizeContainer.children[0];
                        if (!size) {
                            console.log("No size element selectable to attached download count to");
                            continue;
                        }
                        var dwnCount = document.createElement('span');
                        //dwnCount.id = 'grdcounter'
                        dwnCount.className = 'grdcounter color-fg-muted text-sm-right flex-auto'; // Right style
                        //dwnCount.classList.remove('flex-auto');
                        //size.classList.remove('flex-auto');
                        var d = downloadMap[el.href];
                        //if (locale.length) {
                        //  d = d.toLocaleString("en-US");
                        //}
                        dwnCount.appendChild(document.createTextNode(d + ' Downloads'));
                        //var dwnIcon = document.createElement('span');
                        //dwnCount.appendChild(dwnIcon);
                        sizeContainer.insertBefore(dwnCount, size);
                        //size.style.setProperty('flex', 'none', 'important');
                        //dwnCount.style.setProperty('flex', 'none', 'important');
                        dwnCount.style.minWidth = dwnCount.offsetWidth + 3 + 'px';
                        //dwnCount.style.flexGrow = '2';
                        dwnCount.style.marginLeft = '5px';
                    }
                }
                break;
            default:
                console.log('Error: GitHub Release Download Count Request Errored.');
        }
    };
    xmlHttp.open('GET', document.URL.replace('//github.com', '//api.github.com/repos').split('/tag/')[0], true);
    xmlHttp.send(null);
}

(function() {
    'use strict';

    setStyle();
    setObs();

})();
