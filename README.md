# TempoGPT
A simple bot template using the openAI API key to do a specific task through function calling &amp; tools. In this case, a weather bot example. Additionally using firebase to store messages. Made in ReactJS.

## Deployment

1. Usage

```
  git clone https://github.com/vahshellus/TempoGPT.git
```
or simply download the .zip.


2. Install
Use `npm install` to install all of the required dependencies.

## Replacements
- Replace the data in firebase.js with your own firebase web app configurations.
- Add in your openAI API key in chat_bot.py at `OpenAI(api_key='')`
- If you wish to use the weather api in the example, sign up for the OpenWeatherMap for free and add in your API key in `API_KEY`. 

## Possible Python Error
- In `server.js` I'm using `spawn('python3', ['../utility/chatbot.py']);` , if you're using another version of python or  "plain" `python` , then just replace `python3` by `python`
