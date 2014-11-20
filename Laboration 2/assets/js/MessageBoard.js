(function() {

    var numMessages = 0;
    var nameField;
    var textField;
    var messageArea;
    var nrOfMessages;

    var init = function () {
        nameField = document.getElementById("inputName");
        textField = document.getElementById("inputText");
        messageArea = document.getElementById("messagearea");
        nrOfMessages = document.getElementById("nrOfMessages");

        if (textField) {
            textField.onfocus = function() {
                this.className = "focus";
            };
            textField.onblur = function() {
                this.className = "blur"
            };
            document.getElementById("buttonSend").onclick = function() {
                sendMessage();
                return false;
            };

            textField.onkeypress = function (e) {
                if (e.keyCode == 13 && !e.shiftKey) {
                    sendMessage();

                    return false;
                }
            };

            getMessages();
        }
    };

    var getMessages = function () {
        get("/message", renderMessages);

        pollMessages();
    };

    var pollMessages = function () {
        get("/messageEvent", function(messages) {
            renderMessages(messages);
            window.setTimeout(pollMessages, 0);
        });
    };

    var sendMessage = function () {
        if (textField.value == "") {
            return;
        }

        get("/csrfToken", function(data) {
            post("/message", {
                _csrf: data._csrf,
                alias: nameField.value,
                text: textField.value,
            });
        });
    };

    var renderMessages = function (messages) {
        messages && messages
            .map(Message.create)
            .forEach(function(message) {
                numMessages++;
                renderMessage(message);
            });
        nrOfMessages.textContent = numMessages;
    };

    var renderMessage = function (message) {
        // Message div
        var div = document.createElement("div");
        div.className = "message";

        // Clock button
        var aTag = document.createElement("a");
        aTag.href = "#";
        aTag.onclick = function () {
            showTime(message.date);
            return false;
        };

        var imgClock = document.createElement("img");
        imgClock.src = "pic/clock.png";
        imgClock.alt = "Show creation time";

        aTag.appendChild(imgClock);
        div.appendChild(aTag);

        // Message alias
        var alias = document.createElement("p");
        alias.textContent = message.alias + ' said:';
        div.appendChild(alias);

        // Message text
        var text = document.createElement("p");
        text.textContent = message.text;
        div.appendChild(text);

        // Time - Should fix on server!
        var spanDate = document.createElement("span");
        spanDate.appendChild(document.createTextNode(message.date.toLocaleTimeString()));
        div.appendChild(spanDate);

        var spanClear = document.createElement("span");
        spanClear.className = "clear";

        div.appendChild(spanClear);

        messageArea.insertBefore(div, messageArea.firstChild);
    };

    var showTime = function (date) {
        alert("Created " + date.toLocaleDateString() + " at " + date.toLocaleTimeString());
    };

    window.addEventListener('load', init);
})();
