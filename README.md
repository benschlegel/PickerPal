<h1 align="center">PickerPal</h1>
<h2 align="center">A discord bot that helps you make a decision by picking between options you provide.</h2>
<br>
<p align="center">
  <img src="images/logo.png" width=450 />
</p>


---

## Getting started

> Click [**here**](https://discord.com/oauth2/authorize?client_id=1058782828109758497&permissions=2147483648&scope=applications.commands%20bot) to add the bot to your server.

## Sample usage

The easiest way to get started is to use `/make-choice`. This command just takes one argument, the title of the choice.

An example usage would be:

> `/make-choice 'Do i get back to work?'`

This will look like the following image.

<img alt="make-choice" src="https://i.imgur.com/tfiAs0F.png" />


Next, you can use the `✏️ Convert to yes/no choice` button to automatically add a `yes` and a `no` choice to the prompt.

<img alt="make-choice" src="https://i.imgur.com/wGrJsoY.png" />

You could also use `✏️ Add choice` to manually add more options (this is useful if you wanna have more options besides just yes and no)

An example of this would be:

> `/make-choice 'What should i get to eat?'`.

Then, you could use `✏️ Add choice` to add options like `Pizza`, etc.

Once you're done with adding your options, you can use `✅ Make choice` to let the bot pick between all the options you provided.

This will look like the following:

Basic yes/no choice             |  Custom options
:-------------------------:|:-------------------------:
![basic example](https://i.imgur.com/kY7yolG.png)  |  ![custom options](https://i.imgur.com/W4x6kkA.png)




## Permissions

##  **Use Application Commands**

  - This permission is needed, if you want to use commands and interact with the bot in any way.

Since `Use Application Commands` is the only permission this bot needs to run, its unable to send messages, deletes messages, etc. This makes the bot very save.

---

## Local setup

To set this project up locally, you have to:

  - clone the project
  - run `npm install` or `pnpm install`
  - add a file to start the bot (later referred to as `startBot.ps1`)
  - run `./startBot.ps1`

### Setup file
The file needed to start the bot needs to contain the following things:

*`startBot.ps1`*
```ps1
# Save this file as `startBot.ps1`
# can be ported for linux/mac as well, use appropriate syntax
$env:TOKEN = <your-token>
$env:CLIENT_ID = <your-client-id>
$env:MONGO_URI = <your-mongo-uri>

pnpm build
node build/index.js
```
To run this locally, you need to create a new discord bot via the discord developer api (can be found [here](https://discord.com/developers/applications)).

Fill the environment variables using the appropriate fields from your bot.

Additionally, you need a `mongodb`-uri to handle data. I used atlas for this (can be found [here](https://cloud.mongodb.com/)).
