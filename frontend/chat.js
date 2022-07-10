const apiUrl = "http://localhost:8000/api/";
const bigDataCloudApiKey = 'd08ba69254c44e4fbfc0fd8d20bb4ffa';

const userIP = (async function getIP() {
    const response = await fetch('https://api.bigdatacloud.net/data/ip-geolocation?key=' + bigDataCloudApiKey);
    const locationInfo = await response.json();
    return locationInfo.ip;
})();

let pending = false;

async function waitForResponse() {
    const inputText = input.value.trimEnd();
    input.value = inputText;
    let count = 0;
    let interval = setInterval(() => {
        if (pending) {
            if (count === 3) {
                count = 0;
                input.value = inputText;
            }
            else {
                input.value += ".";
                count++;
            }
        }
        else {
            clearInterval(interval);
            return;
        }
    }, 600);
}

const messageList = document.querySelector(".message-list");
const input = document.querySelector('.input');
const sendbtn = document.querySelector(".send");
sendbtn.addEventListener('click', sendMessage);
input.addEventListener('keyup', (event) => {
    event.preventDefault();
    if (event.keyCode === 13)
        sendbtn.click();
})

function showMessage(message) {
    const newMessageContainer = document.createElement('div');
    newMessageContainer.className = 'message-container';
    newMessageContainer.innerHTML = `
        <p class="${message.isOffensiveInUserView ? 'offensive-message' : 'normal-message'} message">${message.text}</p>
        <div class="prediction-container">
            <p class="prediction">${message.isOffensiveInUserView ? 'توهین آمیز است' : 'توهین آمیز نیست'}</p>
            <div class="confirm-dialog">
                <img class="confirm" src="./confirm.png">
                <img class="decline" src="./decline.png">
            </div>
        </div>`;
    newMessageContainer.querySelector('.confirm').addEventListener('click', async () => {
        removeConfirmDialog(newMessageContainer);
    });
    newMessageContainer.querySelector('.decline').addEventListener('click', async () => {
        const newMessage = await handleDecline(message);
        removeConfirmDialog(newMessageContainer);
        newMessageContainer.querySelector('.message').className = `${newMessage.isOffensiveInUserView ? 'offensive-message' : 'normal-message'} message`;
        newMessageContainer.querySelector('.prediction').innerHTML = newMessage.isOffensiveInUserView ? 'توهین آمیز است' : 'توهین آمیز نیست';
    });
    messageList.appendChild(newMessageContainer);
    
    messageList.scrollTop = messageList.scrollHeight;
}

function removeConfirmDialog(messageContainer) {
    messageContainer.querySelector('.confirm-dialog').remove();
}

async function handleDecline(message) {
    const response = await fetch(apiUrl + "messages/" + message.id, {method: 'PATCH', body: JSON.stringify({isOffensiveInUserView: !message.isOffensiveInModelView}), headers: {'Content-Type': 'application/json'}});
    if (response.ok) {
        const newMessage = await response.json();
        return newMessage;
    }
}

async function sendMessage() {
    const inputText = input.value.trim();
    if (!inputText)
        return;

    pending = true;
    async function request() {
        const response = await fetch(apiUrl + "messages",
            {
                method: 'POST',
                body: JSON.stringify({text: inputText, userIP: await userIP}),
                headers: {'Content-Type': 'application/json'},
            }
        );
        pending = false;
        return response;
    };
    const responses = await Promise.all([request(), waitForResponse()]);
    const response = responses[0];
    pending = false;
    if (response.ok) {
        const message = await response.json();
        showMessage(message);
    }
    
    input.value = '';
}