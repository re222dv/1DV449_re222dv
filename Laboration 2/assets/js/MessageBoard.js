(function() {

    var messages = [];
    var nameField;
    var textField;
    var messageArea;
    var nrOfMessages;

    var init = function () {
        nameField = document.getElementById("inputName");
        textField = document.getElementById("inputText");
        messageArea = document.getElementById("messagearea");
        nrOfMessages = document.getElementById("nrOfMessages");

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
    };

    var getMessages = function () {
        get("/message", function(messages) {
            messages
                .map(Message.create)
                .forEach(function(message) {
                    messages.push(message);
                    renderMessage(message);
                });
            nrOfMessages.textContent = messages.length;
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

            renderMessage(
                Message.create({
                    alias: nameField.value,
                    text: textField.value,
                })
            );
            nrOfMessages.textContent = messages.length;
        });

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

        messageArea.appendChild(div);
    };

    var showTime = function (date) {
        alert("Created " + date.toLocaleDateString() + " at " + date.toLocaleTimeString());
    };

    window.addEventListener('load', init);
})();
