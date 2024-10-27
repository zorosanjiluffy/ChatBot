const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileuploadWrapper = document.querySelector(".file-upload-wrapper")

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

const API_KEY = `AIzaSyDy-gy6DQeZJR4HU6cyjO_YJ1h4_026IgE`;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;


// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Generate bot response using API
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text")
    // API request options
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
            }]
        })
    }
    try {
        // Fetch bot response fron API
        const response = await fetch(API_URL, requestOptions)
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message)

        // extract and display bot's response text
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;
    }
    catch (error) {
        console.log(error)
        messageElement.innerText = error.message;
        messageElement.style.color = "#ff0000"
    } finally {
        userData.file = {}
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });



    }
}

// Handle outgoing user message
const handleOutgoingMessage = (e) => {
    e.preventDefault();

    userData.message = messageInput.value.trim();
    messageInput.value = "";


    // Create and display user message
    const messageContent = `<div class="message-text"></div>
                                    ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });




    setTimeout(() => {


        const messageContent = `    <img class="bot-avatar" src="images/chatbot.png" width="50px" height="50px">
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>

                    </div>
                </div>`;



        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);

    }, 600)


}

messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage) {
        handleOutgoingMessage(e);
    }
})

// Handle file input change
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];


    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileuploadWrapper.querySelector("img").src = e.target.result;
        fileuploadWrapper.classList.add("file-uploaded")

        const base64String = e.target.result.split(",")[1];


        // store file data in userData
        userData.file = {
            data: base64String,
            mime_type: file.type
        }
        fileInput.value = "";


    }


});

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => {
    fileInput.click()
})