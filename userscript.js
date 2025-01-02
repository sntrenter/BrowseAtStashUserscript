// ==UserScript==
// @name         Browse at folder update
// @namespace    http://tampermonkey.net/
// @version      2024-12-29
// @description  Add a button to search for files in the same folder and update it on field or video changes
// @author       sntrenter
// @match        http://localhost:9999/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.localhost
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function createOrUpdateButton(type, tabContent, folderPath) {
        let adjustedPath = folderPath.replace(/\//g, "\\").replace(/\\/g, "\\\\") + "\\\\";
        adjustedPath = adjustedPath.replace(/%7B/g, "{").replace(/%7D/g, "}").replace(/%5F/g, "_");
        const searchParams = `("type":"path","value":"\\"${adjustedPath}\\"","modifier":"INCLUDES")`;
        const searchURL = `/${type}?c=${encodeURIComponent(searchParams)}&sortby=path`;

        const oldButton = document.querySelector("#folder-search-button");
        if (oldButton) {
            oldButton.remove();
        }

        const button = document.createElement("a");
        button.id = "folder-search-button";
        button.textContent = "Search Folder";
        button.href = searchURL;
        button.style.display = "inline-block";
        button.style.padding = "10px";
        button.style.margin = "10px";
        button.style.backgroundColor = "#007BFF";
        button.style.color = "white";
        button.style.textDecoration = "none";
        button.style.borderRadius = "5px";
        button.style.textAlign = "center";
        button.style.cursor = "pointer";

        button.onmouseenter = () => (button.style.backgroundColor = "#0056b3");
        button.onmouseleave = () => (button.style.backgroundColor = "#007BFF");

        tabContent.prepend(button);
    }

    function updateButton() {
        setTimeout(() => {
            const tabContent = document.querySelector("div.tab-content");
            if (!tabContent) return;

            const fileLink = Array.from(tabContent.querySelectorAll("a"))
                .find(link => link.href.startsWith("file:///"));

            if (fileLink) {
                const filePath = new URL(fileLink.href).pathname;
                const folderPath = filePath.substring(0, filePath.lastIndexOf('/')).replace(/%20/g, " ");
                console.log(folderPath);

                const type = "scenes";
                createOrUpdateButton(type, tabContent, folderPath);
            }
        }, 100);
    }

    function monitorVideoChanges() {
        const video = document.querySelector("#VideoJsPlayer_html5_api");

        if (video) {
            console.log("Monitoring video element for changes...");

            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.attributeName === "src" || mutation.attributeName === "poster") {
                        console.log("Video attribute changed:", mutation.attributeName);
                        updateButton();
                    }
                }
            });

            observer.observe(video, {
                attributes: true, // Observe attribute changes
                attributeFilter: ["src", "poster"], // Only watch for `src` and `poster` changes
            });
        } else {
            console.log("Video element not found. Retrying...");
            setTimeout(monitorVideoChanges, 100); // Retry if the video element is not yet available
        }
    }

    document.body.addEventListener("click", (event) => {
        if (event.target.dataset.rbEventKey === "scene-file-info-panel" || event.target.dataset.rbEventKey === "image-file-info-panel") {
            updateButton();
        }
    });

    // Initial button setup and monitor video changes
    updateButton();
    monitorVideoChanges();
})();
