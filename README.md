kev-bot
=================

kev-bot is a discord bot for playing custom audio clips. The bot utilzes the discord.js library, MySQL, Google Cloud Storage and Heroku. See below for more information.

Table of contents
=================

- [Commands](#commands)
    - [Audio Commands](#audio-commands)
    - [List Command](#list-command)
    - [Greeting Commands](#greeting-commands)
    - [Upload Command](#upload-command)
    - [Category Commands](#category-commands)
    - [Help Command](#help-command)
- [Code Architecture](#code-architecture)
    - [Node, Discord.js, Discord API](#node-discord.js-discord-api)
    - [Heroku](#heroku)
    - [MySQL](#mysql)
    - [Google Cloud Storage](#google-cloud-storage)

Commands
=================

All commands to the bot are text commands. Commands can be sent in a text channel of a Discord Guild that the bot is a member of. Select commands can be sent directly to the bot (most commands except for the ones that actually play audio). All commands have the following basic syntax:
```
commandName!arg1 arg2 arg3 ... argN
```
The `commandName` is the name of the command that will be envoked and everything after the `!` are the arguments of that specific command. Here are some common example commands:
```
p!chump
pr!all
list!all
list!mostplayed
upload! (with .mp3 file attached)
setgreeting!foryourhealth
```
### Audio Commands

| `commandName`| Argument 1      | Argument 2           | Description                                                       | Example Usage    |
| :----------  | :----------     | :----------          | :----------                                                       | :----------      |
| `p`          | `audioClipName` | `none`               | Plays the given `audioClipName`                                   | `p!hellogov`     |
| `pr`         | `categoryName`  | `none`               | Plays a random clip from the given `categoryName`                 | `pr!all`         |
| `raid`       | `audioClipName` | `voiceChannelIndex`  | Plays the given `audioClipName` in the given `voiceChannelIndex`  | `raid!chump 3`   |

### List Command

<table>
       <tr>
              <th><code>commandName</code></th>
              <th>Argument 1</th>
              <th>Argument 2</th>
              <th>Description</th>
              <th>Example Usage</th>
       </tr>
       <tr>
              <td><code>list</code></code></td>
              <td><code>categoryName</code></td>
              <td><code>numOfMostPlayed</code> (optional)</td>
              <td>
                     The bot will DM the user a list of everything in the given <code>categoryName</code>. If the <code>categoryName</code> of <code>mostplayed</code> is used the default list length is 25. The user can provide the optional argument <code>numOfMostPlayed</code> 
              </td>
              <td><code>list!all</code> , <code>list!mostplayed 10</code></td>
       </tr>
       </table>

Note there are are some specialized `categoryNames` that can be used with the `list!` command and the `pr!` command. See the table below:

| `categoryName`        | Description                                                                                         | Compatible with commmands   |
| :----------           | :----------                                                                                         | :----------                 |
| `all`, `' '`          | All audio clips. Note providing no `categoryName` will be interpreted as `all`                      | `list!`, `pr!`              |
| `mostplayed`          | The most played audio clips. Note the user can request the specific amount, so top 5, 10, 54 etc... | `list!`, `pr!`              |
| `myuploads`           | The audio clips that the user has personally uploaded                                               | `list!`, `pr!`              |
| `categories`, `cats`  | Lists all the categories that have audio clips assigned to them                                     | `list!`                     |
| `emptycats`           | List all the categoires that have no clips assigned                                                 | `list!`                     |
| `allcats`             | Lists all categories whether empty or not                                                           | `list!`                    

### Greeting Commands

Each user can set a specific audio clip to be their greeting. The bot will play the user's greeting anytime a user joins a discord voice channel. The greeting is not played when switching between voice channels in the same discord.

| `commandName` | Argument 1      | Description                                                         | Example Usage           |
| :----------   | :----------     | :----------                                                         | :----------             |
| `setgreeting` | `audioClipName` | Sets the user's greeting to the given `audioClipName`               | `setgreeting!hellogov`  |
| `delgreeting` | `none`          | Deletes/removes the user's greeting. No greeting will be played now | `delgreeting!`          |
| `getgreeting` | `none`          | The bot will DM the user the name of their current greeting         | `getgreeting!`          |

### Upload Command

| `commandName`| Special Arguments     | Description                                                                                                            | Example Usage            |
| :----------  | :----------           | :----------                                                                                                            | :----------              |
| `upload`     | `mp3 File`            | Uploads the attached mp3 file to the bot's google cloud storage. There are restrictions on the max length of the file  | `upload!` w/ mp3 attached|

![upload.gif](/gifs/upload.gif)

### Category Commands

The bot supports categories, which allows the user to group audio clips into categories and then play a random clip from that category with the `pr!` command. It is also possible to list all of the clips in a certain category with the `list!` command. Categories can be created with the `newcategory!` command and clips can be added to a category with the `addtocat!` command. See the table below for more details and a full list of category commands.

<table>
       <tr>
              <th><code>commandName</code></th>
              <th>Argument 1</th>
              <th>Argument 2+</th>
              <th>Description</th>
              <th>Example Usage</th>
       </tr>
       <tr>
              <td><code>newcategory</code></td>
              <td><code>categoryName</code></td>
              <td><code>none</code></td>
              <td>Creates a new category with the given <code>categoryName</code></td>
              <td><code>newcategory!arnold</code></td>
       </tr>
       <tr>
              <td><code>delcategory</code></td>
              <td><code>categoryName</code></td>
              <td><code>none</code></td>
              <td>Deletes the category with the given <code>categoryName</code></td>
              <td><code>delcategory!arnold</code></td>
       </tr>
       <tr>
              <td><code>addtocat</code></td>
              <td><code>categoryName</code></td>
              <td><code>audioClipNames</code></td>
              <td>Adds the given <code>audioClipNames</code> to the given <code>categoryName</code></td>
              <td><code>addtocat!arnold icetomeetyou whoisyourdaddy magicschoolbus</code></td>
       </tr>
       <tr>
              <td><code>delfromcat</code></td>
              <td><code>categoryName</code></td>
              <td><code>audioClipNames</code></td>
              <td>Deletes the given <code>audioClipNames</code> from the given <code>categoryName</code></td>
              <td><code>delfromcat!arnold magicschoolbus</code></td>
       </tr>
       <tr>
              <td><code>addcatsto</code></td>
              <td><code>audioClipName</code></td>
              <td><code>categoryNames</code></td>
              <td>Adds the given <code>audioClipName</code> to the given <code>categoryNames</code></td>
              <td><code>addcatsto!billions trump president smart</code></td>
       </tr>
       <tr>
              <td><code>delcatsfrom</code></td>
              <td><code>audioClipName</code></td>
              <td><code>categoryNames</code></td>
              <td>Removes the given <code>audioClipName</code> from the given <code>categoryNames</code></td>
              <td><code>delcatsfrom!billions smart</code></td>
       </tr>
</table>

![categories.gif](/gifs/categories.gif)

### Help Command

| `commandName` | Argument 1     | Description                                                                                                                 | Example Usage            |
| :----------   | :----------    | :----------                                                                                                                 | :----------              |
| `help`        | `helpCategory` | The bot will DM the user helpful info on all the commands. Currently the only `helpCategies` are {`kb`,`kevbot`,`kev-bot`}  | `help!kb`                |

Code Architecture
=================

Below you can find a diagram depicting the architecture of kev-bot. Note the main resources being leveraged by this project are: Node, Discord.js, the Discord API, Heroku, MySQL, GitHub, and Google Cloud.

![architecture](/docs/architecture.png)

### Node, Discord.js, Discord API
The javascript code that runs on node is the brains of the bot. The Discord.js library is used to interact with the Discord API.

### Heroku
Heroku is a cloud computing platform that allows you to host processes. The javsascript code as well as the MySQL Database are both hosted on Heroku. Note that GitHub is connected to Heroku so that anytime the master branch is pushed to it will update the code on the Heroku server.
### MySQL
The MySQL database stores a variety of permanent data that makes features like *categories* or *greetings* possible. See below for a visual representation of the database.

![tables](/docs/sql_tables.png)

### Google Cloud Storage
A Google Cloud Storage bucket is used to store all the mp3 files. The bot downloads all of the files on startup of a new build.