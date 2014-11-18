var MessageBoard = {

    messages: [],
    textField: null,
    messageArea: null,

    init:function(e)
    {
	
		    MessageBoard.textField = document.getElementById("inputText");
		    MessageBoard.nameField = document.getElementById("inputName");
            MessageBoard.messageArea = document.getElementById("messagearea");
    
            // Add eventhandlers    
            document.getElementById("inputText").onfocus = function(e){ this.className = "focus"; }
            document.getElementById("inputText").onblur = function(e){ this.className = "blur" }
            document.getElementById("buttonSend").onclick = function(e) {MessageBoard.sendMessage(); return false;}
            document.getElementById("buttonLogout").onclick = function(e) {MessageBoard.logout(); return false;}
    
            MessageBoard.textField.onkeypress = function(e){ 
                                                    if(!e) var e = window.event;
                                                    
                                                    if(e.keyCode == 13 && !e.shiftKey){
                                                        MessageBoard.sendMessage(); 
                                                       
                                                        return false;
                                                    }
                                                }
    
    },
    getMessages:function() {
        console.log("INNE");
        $.ajax({
			type: "GET",
			url: "functions.php",
			data: {function: "getMessages"}
		}).done(function(data) { // called when the AJAX call is ready
						
			data = JSON.parse(data);
		
			
			for(var mess in data) {
				var obj = data[mess];
			    var text = obj.name +" said:\n" +obj.message;
				var mess = new Message(text, new Date());
                var messageID = MessageBoard.messages.push(mess)-1;
    
                MessageBoard.renderMessage(messageID);
				
			}
			document.getElementById("nrOfMessages").innerHTML = MessageBoard.messages.length;
			
		});
	

    },
    sendMessage:function(){
        
        if(MessageBoard.textField.value == "") return;
        
        // Make call to ajax
        $.ajax({
			type: "GET",
		  	url: "functions.php",
		  	data: {function: "add", name: MessageBoard.nameField.value, message:MessageBoard.textField.value}
		}).done(function(data) {
		  alert("Your message is saved! Reload the page for watching it");
		});
    
    },
    renderMessages: function(){
        // Remove all messages
        MessageBoard.messageArea.innerHTML = "";
     
        // Renders all messages.
        for(var i=0; i < MessageBoard.messages.length; ++i){
            MessageBoard.renderMessage(i);
        }        
        
        document.getElementById("nrOfMessages").innerHTML = MessageBoard.messages.length;
    },
    renderMessage: function(messageID){
        // Message div
        var div = document.createElement("div");
        div.className = "message";
       
        // Clock button
        aTag = document.createElement("a");
        aTag.href="#";
        aTag.onclick = function(){
			MessageBoard.showTime(messageID);
			return false;			
		}
        
        var imgClock = document.createElement("img");
        imgClock.src="pic/clock.png";
        imgClock.alt="Show creation time";
        
        aTag.appendChild(imgClock);
        div.appendChild(aTag);
       
        // Message text
        var text = document.createElement("p");
        text.innerHTML = MessageBoard.messages[messageID].getHTMLText();        
        div.appendChild(text);
            
        // Time - Should fix on server!
        var spanDate = document.createElement("span");
        spanDate.appendChild(document.createTextNode(MessageBoard.messages[messageID].getDateText()))

        div.appendChild(spanDate);        
        
        var spanClear = document.createElement("span");
        spanClear.className = "clear";

        div.appendChild(spanClear);        
        
        MessageBoard.messageArea.appendChild(div);       
    },
    removeMessage: function(messageID){
		if(window.confirm("Vill du verkligen radera meddelandet?")){
        
			MessageBoard.messages.splice(messageID,1); // Removes the message from the array.
        
			MessageBoard.renderMessages();
        }
    },
    showTime: function(messageID){
         
         var time = MessageBoard.messages[messageID].getDate();
         
         var showTime = "Created "+time.toLocaleDateString()+" at "+time.toLocaleTimeString();

         alert(showTime);
    },
    logout: function() {
        window.location = "index.php";
    }
}

window.onload = MessageBoard.init;