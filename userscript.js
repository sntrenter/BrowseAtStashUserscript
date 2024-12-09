// ==UserScript==
// @name         Browse at folder
// @namespace    http://tampermonkey.net/
// @version      2024-12-09
// @description  Add a button to search for files in the same folder
// @author       sntrenter
// @match        http://localhost:9999/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.localhost
// @grant        none
// ==/UserScript==
//may need to fix encodings https://www.w3schools.com/tags/ref_urlencode.ASP
(function() {
    'use strict';
    console.log("hello world!");

    // Add a button to search for files in the same folder
    document.body.addEventListener('click', function (event) {
        // File Info tab is clicked
        if (event.target.dataset.rbEventKey === "scene-file-info-panel" || event.target.dataset.rbEventKey === "image-file-info-panel") {
            console.log("hit");
            let type = event.target.dataset.rbEventKey.split("-")[0] + "s";
            console.log(type);

            // Wait for the panel to render
            setTimeout(() => {
                const tabContent = document.querySelector("div.tab-content");
                if (!tabContent) return;

                // Find the file path link
                const fileLink = Array.from(tabContent.querySelectorAll("a"))
                    .find(link => link.href.startsWith("file:///"));

                if (fileLink) {
                    // Extract the folder path
                    const filePath = new URL(fileLink.href).pathname;
                    const folderPath = filePath.substring(0, filePath.lastIndexOf('/')).replace(/%20/g, " ");
                    console.log(folderPath);

                    // Double encode the folder path (but fix escaping issues manually)
                    let adjustedPath = folderPath.replace(/\//g, "\\").replace(/\\/g, "\\\\") + "\\\\";
                    adjustedPath = adjustedPath.replace(/%7B/g,"{").replace(/%7D/g,"}").replace(/%5F/g, "_");
                    const searchParams = `("type":"path","value":"\\"${adjustedPath}\\"","modifier":"INCLUDES")`;

                    console.log(adjustedPath)

                    // Do not double-encode backslashes, encode the whole string correctly
                    const searchURL = `/${type}?c=${encodeURIComponent(searchParams)}&sortby=path`;
                    console.log(searchURL);


                    // Add a hyperlink (styled as a button) to navigate to the search page
                    if (!document.querySelector("#folder-search-button")) {
                        const button = document.createElement("a");
                        button.id = "folder-search-button";
                        button.textContent = "Search Folder";
                        button.href = searchURL; // Set the URL
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
                }
            }, 100); // Allow time for the tab content to load
        }
    });
})();
