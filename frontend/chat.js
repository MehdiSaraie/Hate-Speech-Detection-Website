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

function showOffensivenessPrediction(message) {
    const offensivenessPredictionContainer = document.createElement('div');
    offensivenessPredictionContainer.className = "prediction-container";
    offensivenessPredictionContainer.innerHTML = `
        <p class="prediction">${message.isOffensiveInUserView ? 'توهین آمیز است' : 'توهین آمیز نیست'}</p>
        <div class="confirm-dialog">
            <img class="confirm" src="./confirm.png">
            <img class="decline" src="./decline.png">
        </div>
    `;
    return offensivenessPredictionContainer;
}

function handleOffensivenessFeedback(message, messageContainer, offensivenessPredictionContainer, hatefulnessPredictionContainer) {
    offensivenessPredictionContainer.querySelector('.confirm').addEventListener('click', async () => {
        removeConfirmDialog(offensivenessPredictionContainer);
        if (!message.isOffensiveInUserView) {
            removeConfirmDialog(hatefulnessPredictionContainer);
        }
    });
    offensivenessPredictionContainer.querySelector('.decline').addEventListener('click', async () => {
        const newMessage = await declineOffensiveness(message);
        removeConfirmDialog(offensivenessPredictionContainer);
        if (!newMessage.isOffensiveInUserView) {
            removeConfirmDialog(hatefulnessPredictionContainer);
            hatefulnessPredictionContainer.querySelector('.prediction').innerHTML = 'تنفر آمیز نیست';
        }
        offensivenessPredictionContainer.querySelector('.prediction').innerHTML = newMessage.isOffensiveInUserView ? 'توهین آمیز است' : 'توهین آمیز نیست';
        messageContainer.querySelector('.message').className = `${(newMessage.isOffensiveInUserView || newMessage.isHatefulInUserView) ? 'offensive-message' : 'normal-message'} message`;
    });
}

function showHatefulnessPrediction(message) {
    const hatefulnessPredictionContainer = document.createElement('div');
    hatefulnessPredictionContainer.className = "prediction-container";
    hatefulnessPredictionContainer.innerHTML = `
        <p class="prediction">${message.isHatefulInUserView ? `تنفر آمیز است (${message.hateCategory})` : 'تنفر آمیز نیست'}</p>
        <div class="confirm-dialog">
            <img class="confirm" src="./confirm.png">
            <img class="decline" src="./decline.png">
        </div>
    `;
    return hatefulnessPredictionContainer;
}

function handleHatefulnessFeedback(message, messageContainer, offensivenessPredictionContainer, hatefulnessPredictionContainer) {
    hatefulnessPredictionContainer.querySelector('.confirm').addEventListener('click', async () => {
        removeConfirmDialog(hatefulnessPredictionContainer);
        if (message.isHatefulInUserView) {
            removeConfirmDialog(offensivenessPredictionContainer);
        }
    });
    hatefulnessPredictionContainer.querySelector('.decline').addEventListener('click', async () => {
        const newMessage = await declineHatefulness(message);
        removeConfirmDialog(hatefulnessPredictionContainer);
        if (newMessage.isHatefulInUserView) {
            removeConfirmDialog(offensivenessPredictionContainer);
            offensivenessPredictionContainer.querySelector('.prediction').innerHTML = 'توهین آمیز است';
        }
        hatefulnessPredictionContainer.querySelector('.prediction').innerHTML = newMessage.isHatefulInUserView ? 'تنفر آمیز است' : 'تنفر آمیز نیست';
        messageContainer.querySelector('.message').className = `${(newMessage.isOffensiveInUserView || newMessage.isHatefulInUserView) ? 'offensive-message' : 'normal-message'} message`;
    });
}

function showMessage(message) {
    const newMessageContainer = document.createElement('div');
    newMessageContainer.className = 'message-container';
    newMessageContainer.innerHTML = `<p class="${(message.isOffensiveInUserView ? 'offensive-message' : 'normal-message')} message">${message.text}</p>`;

    const offensivenessPredictionContainer = showOffensivenessPrediction(message);
    newMessageContainer.appendChild(offensivenessPredictionContainer);

    const hatefulnessPredictionContainer = showHatefulnessPrediction(message);
    newMessageContainer.appendChild(hatefulnessPredictionContainer);

    messageList.appendChild(newMessageContainer);
    messageList.scrollTop = messageList.scrollHeight;

    handleOffensivenessFeedback(message, newMessageContainer, offensivenessPredictionContainer, hatefulnessPredictionContainer);
    handleHatefulnessFeedback(message, newMessageContainer, offensivenessPredictionContainer, hatefulnessPredictionContainer);
}

function removeConfirmDialog(predictionContainer) {
    predictionContainer.querySelector('.confirm-dialog')?.remove();
}

async function declineOffensiveness(message) {
    let body = {isOffensiveInUserView: !message.isOffensiveInModelView};
    if (!body.isOffensiveInUserView)
        body.isHatefulInUserView = false
    
    const response = await fetch(apiUrl + "messages/" + message.id, {method: 'PATCH', body: JSON.stringify(body), headers: {'Content-Type': 'application/json'}});
    if (response.ok) {
        const newMessage = await response.json();
        return newMessage;
    }
}

async function declineHatefulness(message) {
    let body = {isHatefulInUserView: !message.isHatefulInModelView};
    if (body.isHatefulInUserView)
        body.isOffensiveInUserView = true

    const response = await fetch(apiUrl + "messages/" + message.id, {method: 'PATCH', body: JSON.stringify(body), headers: {'Content-Type': 'application/json'}});
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