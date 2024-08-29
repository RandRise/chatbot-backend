const { query } = require('../db');
const { convertToTimeZone } = require('../Utils/helper');
const path = require('path')
const fs = require('fs')
const getBotById = async (botId) => {

    const result = await query('SELECT * FROM bots WHERE id = $1', [botId]);
    return result.rows[0];
};

const getBots = async (userId) => {
    try {
        const queryText = `
            SELECT 
                b.id AS bot_id,
                b.domain,
                b.status,
                s.id AS subscription_id,
                s.msgcount,
                s.expirydate
            FROM 
                bots b
            LEFT JOIN 
                subscriptions s ON b.id = s.bot_id
            WHERE
                b.user_id = $1
            ORDER BY b.id
        `;
        const result = await query(queryText, [userId]);

        const bots = result.rows.reduce((acc, row) => {

            const existingBot = acc.find(bot => bot.id === row.bot_id);
            if (existingBot) {

                existingBot.subscriptions.push({
                    id: Number(row.subscription_id),
                    msgcount: Number(row.msgcount),
                    expirydate: convertToTimeZone(row.expirydate, 'Asia/Damascus')
                });
            } else {

                acc.push({
                    id: Number(row.bot_id),
                    domain: row.domain,
                    status: row.status,
                    subscriptions: row.subscription_id
                        ? [{
                            id: Number(row.subscription_id),
                            msgcount: Number(row.msgcount),
                            expirydate: convertToTimeZone(row.expirydate, 'Asia/Damascus')
                        }]
                        : []
                });
            }

            return acc;
        }, []);

        return bots;
    } catch (error) {

        console.error('Error fetching bots:', error);
        throw error;
    }
};

const updateBotStatus = async (botId, newStatus) => {

    try {
        const updateQuery = `
            UPDATE bots
            SET status = $1
            WHERE id = $2
        `;
        const result = await query(updateQuery, [newStatus, botId]);
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error updating bot status:', error);
        throw error;
    }
};


const generateJsFile = async (botId) => {

    //Genrating JS Vanilla File (Working on it)

    const embeddedJs = `
    (function () {
        // Create and inject CSS
        const style = document.createElement('style');
        style.textContent = \`
            @import url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap');
    
            body {
                margin: 0;
                font-family: Open Sans, sans-serif;
                background-color: #f0f2f5;
            }
    
            #chat-container {
                z-index: 999999;
                position: fixed;
                right: 50px;
                bottom: 80px;
                width: 360px;
                background: #fff;
                border-radius: 40px;
                overflow: hidden;
                opacity: 0;
                transform: scale(0.5);
                transform-origin: bottom right;
                box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
    
            #chat-container.show {
                opacity: 1;
                transform: scale(1);
            }
    
            #chat-header {
                background-color: #4a90e2;
                color: #ffffff;
                padding: 15px;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                border-bottom: 1px solid #dddddd;
            }
    
            #chat-body {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background-color: rgb(255, 255, 255);
                position: relative;
                scroll-behavior: smooth;
                min-height: 274px;
                max-height: 274px
            }
    
            #chat-footer {
                padding: 0px 12px 0px 22px;
                background-color: lightgray;
                border-top: 1px solid #dddddd;
                display: flex;
                align-items: center;
                height: 65px;
            }
    
            #chat-input {
                flex: 1;
                padding: 10px 0px 8px 18px;
                border: 1px solid #dddddd;
                border-radius: 20px;
                font-size: 16px;
                background-color: #fff;
                height: 15px;
                outline: none;
                transition: box-shadow 0.5s ease;
            }
    
            #chat-input:focus {
                border: 0px solid #4a90e2;
                box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.4);
            }
    
            #chat-send {
                margin: 16px 9px 15px 9px;
                padding: 0px 1px;
                background-color: #4a90e2;
                color: #ffffff;
                border: 1px solid #fff;
                border-radius: 100%;
                cursor: pointer;
                font-size: 20px;
                height: 35px;
                width: 35px;
                font-weight: bold;
            }
    
            #chat-send:disabled {
                background-color: #b0bec5;
                cursor: not-allowed;
            }
    
            #chat-send:hover:not(:disabled) {
                background-color: #357abd;
            }
    
            .chat-message {
                padding: 10px;
                max-width: 75%;
                color: #333;
                border-radius: 15px;
                position: relative;
                line-height: 1.4;
                word-wrap: break-word;
                vertical-align: top;
                margin-bottom: 10px;
            }
    
            .chat-message.user {
                background-color: #a8cbf0;
                align-self: flex-end;
                text-align: right;
                position: relative;
                margin-left: auto;
                width: fit-content;
                margin-bottom: 10px;
            }
    
            .chat-message.user::before {
                content: '';
                position: absolute;
                bottom: -11px;
                right: 10px;
                border-width: 6px;
                border-style: solid;
                border-color: #a8cbf0 transparent transparent transparent;
            }
    
            .chat-message.bot {
                background-color: #ffffff;
                color: #333;
                padding: 10px;
                max-width: 75%;
                border-radius: 15px;
                position: relative;
                line-height: 1.4;
                word-wrap: break-word;
                vertical-align: top;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                margin-bottom: 10px;
            }
    
            .chat-message.bot::before {
                content: '';
                position: absolute;
                bottom: -11px;
                left: 10px;
                border-width: 6px;
                border-style: solid;
                border-color: #ffffff transparent transparent transparent;
            }
    
            .loader {
                display: none;
                position: fixed;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                width: 100%;
                text-align: center;
                z-index: 10;
            }
    
            .loader-svg {
                width: 40px;
                height: 20px;
                display: flex;
                margin: 55px 30px;
                position: relative;
            }
    
            #chat-icon {
                position: fixed;
                bottom: 40px;
                right: 40px;
                cursor: pointer;
                transition: transform 0.5s ease, right 0.5s ease;
                transform: scale(3.5);
            }
    
            #chat-container.show~#chat-icon {
                transform: translateX(100px);
            }
        \`;
        document.head.appendChild(style);
    
        // Create and inject HTML
        const chatIcon = document.createElement('img');
        chatIcon.id = 'chat-icon';
        chatIcon.src = 'chat-bot-svgrepo-com.svg';
        chatIcon.alt = 'Chat Bot';
        document.body.appendChild(chatIcon);
    
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-container';
        chatContainer.innerHTML = \`
            <div id="chat-header">Customer Service AI Assistant</div>
            <div id="chat-body" aria-live="polite">
                <div class="loader" id="loader">
                    <svg width="100" height="20" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg" class="loader-svg">
                        <circle cx="10" cy="10" r="10" fill="#4a90e2">
                            <animate attributeName="cy" values="10;5;10" dur="0.6s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="30" cy="10" r="10" fill="#4a90e2">
                            <animate attributeName="cy" values="10;5;10" dur="0.6s" begin="0.2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="50" cy="10" r="10" fill="#4a90e2">
                            <animate attributeName="cy" values="10;5;10" dur="0.6s" begin="0.4s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                </div>
            </div>
            <div id="chat-footer">
                <input type="text" id="chat-input" placeholder="Type your message...">
                <button id="chat-send">➢</button>
            </div>
        \`;
        document.body.appendChild(chatContainer);
    
        // JavaScript functionality
        const sendMessageUrl = 'http://localhost:3000/send-message';
        const registerUrl = 'http://localhost:3000/register-session-key';
        const fetchAllMessagesUrl = 'http://localhost:3000/fetch-all-messages';
        const sessionKeyStorageKey = 'chatbot_session_key';
    
        let sessionKey;
        let sessionInitialized = false;
    
        const botId = ${'' + botId};
        const chatBody = document.getElementById('chat-body');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const loader = document.getElementById('loader');
    
        function generateSessionKey(length = 32) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let sessionKey = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                sessionKey += characters[randomIndex];
            }
            return sessionKey;
        }
    
        function registerSessionKey(botId, sessionKey) {
            return fetch(registerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bot_id: botId, session_key: sessionKey })
            }).then(response => response.json())
              .then(data => {
                  if (data.code === 200) {
                      localStorage.setItem("BotID" + botId + "_"  + sessionKeyStorageKey, sessionKey);
                      return sessionKey;
                  } else {
                      throw new Error('Failed to register session key: ' + data.message);
                  }
              });
        }
    
        function fetchMessages() {
            return fetch(fetchAllMessagesUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session_key: sessionKey })
            }).then(response => response.json())
              .then(data => {
                  if (data.code === 200) {
                      data.data.messages.forEach(message => {
                          addMessage(message.type === 1 ? 'user' : 'bot', message.content);
                      });
                  } else {
                      throw new Error('Error loading messages: ' + data.message);
                  }
              });
        }
    
        function sendMessage(message, sessionKey) {
            return fetch(sendMessageUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message, session_key: sessionKey })
            }).then(response => response.json());
        }
    
        function addMessage(role, message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message ' + role;
            messageElement.innerText = message;
            chatBody.appendChild(messageElement);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    
        function toggleUI(isLoading) {
            loader.style.display = isLoading ? 'flex' : 'none';
            chatSend.disabled = isLoading;
            chatInput.disabled = isLoading;
        }
    
        function initializeSession() {
            sessionKey = localStorage.getItem("BotID" + botId + "_"  + sessionKeyStorageKey);
    
            if (!sessionKey) {
                sessionKey = generateSessionKey();
                return registerSessionKey(botId, sessionKey)
                    .then(registeredSessionKey => {
                        sessionKey = registeredSessionKey;
                        sessionInitialized = true;
                    })
                    .catch(error => {
                        console.error('Error initializing session:', error);
                    });
            } else {
                sessionInitialized = true;
                return fetchMessages();
            }
        }
    
        function handleSendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;
    
            addMessage('user', message);
            chatInput.value = '';
            toggleUI(true);
    
            sendMessage(message, sessionKey)
                .then(response => {
                    if(response.code === 200) {

                    addMessage('bot', response.data.answer);
                    } else {
                     addMessage('bot', response.message);
                    }
                })
                .catch(error => {
                    console.error('Error sending message to bot:', error);
                    addMessage('bot', 'An error occurred while communicating with the server.');
                })
                .finally(() => {
                    toggleUI(false);
                });
        }
    
        function toggleChatContainer() {
            document.getElementById('chat-container').classList.toggle('show');
        }
    
        chatSend.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSendMessage();
            }
        });
    
        document.getElementById('chat-icon').addEventListener('click', toggleChatContainer);
    
        window.addEventListener('click', function (event) {
            if (!document.getElementById('chat-container').contains(event.target) &&
                event.target.id !== 'chat-icon') {
                document.getElementById('chat-container').classList.remove('show');
            }
        });
    
        initializeSession();
    })();
    `;

    const filePath = path.join(__dirname, '../public', `web-bot-${botId}.js`);

    fs.writeFile(filePath, embeddedJs, (err) => {
        if (err) {
            console.error('Error writing HTML file:', err);
            throw err;
        }
        console.log(`HTML file for bot ${botId} generated at ${filePath}`);
    });

    await updateBotStatus(botId, newStatus = 1)

}
module.exports = {
    getBotById,
    getBots,
    updateBotStatus,
    generateJsFile,
};
