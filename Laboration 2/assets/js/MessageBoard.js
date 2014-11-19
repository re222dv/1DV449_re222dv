var MessageBoard = {

    messages: [],
    textField: null,
    messageArea: null,

    init: function () {

        MessageBoard.textField = document.getElementById("inputText");
        MessageBoard.nameField = document.getElementById("inputName");
        MessageBoard.messageArea = document.getElementById("messagearea");

        // Add eventhandlers
        document.getElementById("inputText").onfocus = function() {
            this.className = "focus";
        };
        document.getElementById("inputText").onblur = function() {
            this.className = "blur"
        };
        document.getElementById("buttonSend").onclick = function() {
            MessageBoard.sendMessage();
            return false;
        };

        MessageBoard.textField.onkeypress = function (e) {
            if (e.keyCode == 13 && !e.shiftKey) {
                MessageBoard.sendMessage();

                return false;
            }
        }

    },
    getMessages: function () {
        $.ajax({
                type: "GET",
                url: "/message",
        })
        .done(function (messages) {
            messages
                .map(Message.create)
                .forEach(function(message) {
                    MessageBoard.messages.push(message);
                    MessageBoard.renderMessage(message);
                });
            document.getElementById("nrOfMessages").textContent = MessageBoard.messages.length;
        });


    },
    sendMessage: function () {

        if (MessageBoard.textField.value == "") {
            return;
        }

        // Make call to ajax
        $.ajax(
            {
                type: "GET",
                url: "/csrfToken",
            }
        )
        .done(function(data) {
            $.ajax({
                type: "POST",
                url: "/message",
                data: {
                    _csrf: data._csrf,
                    alias: MessageBoard.nameField.value,
                    text: MessageBoard.textField.value,
                }
            })
            .done(function() {
                alert("Your message is saved! Reload the page for watching it");
            });
        });

    },
    renderMessages: function () {
        // Remove all messages
        MessageBoard.messageArea.innerHTML = "";

        // Renders all messages.
        MessageBoard.messages.forEach(function(message) {
            MessageBoard.renderMessage(message);
        });

        document.getElementById("nrOfMessages").textContent = MessageBoard.messages.length;
    },
    renderMessage: function (message) {
        // Message div
        var div = document.createElement("div");
        div.className = "message";

        // Clock button
        var aTag = document.createElement("a");
        aTag.href = "#";
        aTag.onclick = function () {
            MessageBoard.showTime(message.date);
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

        MessageBoard.messageArea.appendChild(div);
    },
    removeMessage: function (messageID) {
        if (window.confirm("Vill du verkligen radera meddelandet?")) {

            MessageBoard.messages.splice(messageID, 1); // Removes the message from the array.

            MessageBoard.renderMessages();
        }
    },
    showTime: function (date) {
        alert("Created " + date.toLocaleDateString() + " at " + date.toLocaleTimeString());
    }
};

window.onload = MessageBoard.init;
