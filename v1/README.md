# kev-bot

kev-bot is a discord bot for playing custom audio clips. The bot utilizes the discord.js library, MySQL, Google Cloud Storage and Heroku. See below for more information.

# Table of contents

- [kev-bot](#kev-bot)
- [Table of contents](#table-of-contents)
- [Commands](#commands)
  - [Audio Commands](#audio-commands)
  - [List Command](#list-command)
  - [Greeting Commands](#greeting-commands)
  - [Farewell Commands](#farewell-commands)
  - [Upload Command](#upload-command)
  - [Category Commands](#category-commands)
  - [Help Command](#help-command)
- [Code Architecture](#code-architecture)
  - [Node, Discord.js, Discord API](#node-discordjs-discord-api)
  - [Heroku](#heroku)
  - [MySQL](#mysql)
  - [Google Cloud Storage](#google-cloud-storage)
- [Release Notes](#release-notes)
  - [v1.2.0](#v120)
  - [v1.1.1](#v111)
  - [v1.1.0](#v110)
  - [v1.0.0](#v100)

# Commands

All commands to the bot are text commands. Commands can be sent in a text channel of a Discord Guild that the bot is a member of. Select commands can be sent directly to the bot (most commands except for the ones that actually play audio). All commands have the following basic syntax:

```
commandName!arg1 arg2 arg3 ... argN
```

The `commandName` is the name of the command that will be called and everything after the `!` are the arguments of that specific command. Here are some common example commands:

```
p!chump
pr!all
list!all
list!mostplayed
upload! (with .mp3 file attached)
setgreeting!foryourhealth
```

### Audio Commands

| `commandName` | Argument 1      | Argument 2          | Description                                                      | Example Usage  |
| :------------ | :-------------- | :------------------ | :--------------------------------------------------------------- | :------------- |
| `p`           | `audioClipName` | `none`              | Plays the given `audioClipName`                                  | `p!hellogov`   |
| `pr`          | `categoryName`  | `none`              | Plays a random clip from the given `categoryName`                | `pr!all`       |
| `raid`        | `audioClipName` | `voiceChannelIndex` | Plays the given `audioClipName` in the given `voiceChannelIndex` | `raid!chump 3` |

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

| `categoryName`       | Description                                                                                         | Compatible with commmands |
| :------------------- | :-------------------------------------------------------------------------------------------------- | :------------------------ |
| `categories`, `cats` | All of the categories                                                                               | `list!`                   |
| `emptycats`          | All of the categories that have no clips                                                            | `list!`                   |
| `all`                | All audio clips. Note providing no `categoryName` will be interpreted as `all`                      | `list!`, `pr!`            |
| `mostplayed`         | The most played audio clips. Note the user can request the specific amount, so top 5, 10, 54 etc... | `list!`, `pr!`            |
| `myuploads`          | The audio clips that the user has personally uploaded                                               | `list!`, `pr!`            |
| `playhistory`        | The most recently played audio clips                                                                | `list!`, `pr!`            |
| `uploadhistory`      | The most recently uploaded audio clips                                                              | `list!`, `pr!`            |

### Greeting Commands

Each user can set a specific audio clip to be their greeting. The bot will play the user's greeting anytime a user joins a discord voice channel. The greeting is not played when switching between voice channels in the same discord.

| `commandName` | Argument 1                        | Argument 2 | Description                                                                                                                              | Example Usage          |
| :------------ | :-------------------------------- | ---------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| `setgreeting` | `audioClipName` or `categoryName` | `type`     | Sets the user's greeting to the given `audioClipName`. Specifiy the `type` (file or category) if the file or category name is ambiguous. | `setgreeting!hellogov` |
| `delgreeting` | `none`                            | `none`     | Deletes/removes the user's greeting. No greeting will be played now.                                                                     | `delgreeting!`         |
| `getgreeting` | `none`                            | `none`     | The bot will DM the user the name of their current greeting.                                                                             | `getgreeting!`         |

### Farewell Commands

Each user can set a specific audio clip to be their farewell. The bot will play the user's farewell anytime a user disconnects from a discord guild. The farewell is not played when switching between voice channels in the same discord. **Note that farewells are limited to 3 sec**.

| `commandName` | Argument 1      | Description                                                                     | Example Usage        |
| :------------ | :-------------- | :------------------------------------------------------------------------------ | :------------------- |
| `setfarewell` | `audioClipName` | Sets the user's farewell to the given `audioClipName`. Max clip length is 3 sec | `setfarewell!solong` |
| `delfarewell` | `none`          | Deletes/removes the user's farewell. No farewell will be played now.            | `delfarewell!`       |
| `getfarewell` | `none`          | The bot will DM the user the name of their current farewell.                    | `getfarewell!`       |

### Upload Command

| `commandName` | Arguments 1+               | Special Arguments | Description                                                                                                                                                                                                      | Example Usage                   |
| :------------ | :------------------------- | :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| `upload`      | `categoryNames` (optional) | `mp3 File`        | Uploads the attached mp3 file to the bot's google cloud storage. There are restrictions on the max length of the file and the name. The user can optionally include categories that the file should be added to. | `upload!arnold` w/ mp3 attached |

![upload.gif](/docs/gifs/upload.gif)

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

![categories.gif](/docs/gifs/categories.gif)

### Help Command

| `commandName` | Argument 1     | Description                                                                                                                  | Example Usage |
| :------------ | :------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------------ |
| `help`        | `helpCategory` | The bot will DM the user helpful info on all the commands. Currently the only `helpCategories` are {`kb`,`kevbot`,`kev-bot`} | `help!kb`     |

# Code Architecture

Below you can find a diagram depicting the architecture of kev-bot. Note the main resources being leveraged by this project are: Node, Discord.js, the Discord API, Heroku, MySQL, GitHub, and Google Cloud.

![architecture](/docs/architecture.png)

### Node, Discord.js, Discord API

The javascript code that runs on node is the brains of the bot. The Discord.js library is used to interact with the Discord API.

### Heroku

Heroku is a cloud computing platform that allows you to host processes. The javascript code as well as the MySQL Database are both hosted on Heroku. Note that GitHub is connected to Heroku so that anytime the master branch is pushed to it will update the code on the Heroku server.

### MySQL

The MySQL database stores a variety of permanent data that makes features like _categories_ or _greetings_ possible. See below for a visual representation of the database.

![tables](/docs/sql_tables.png)

### Google Cloud Storage

A Google Cloud Storage bucket is used to store all the mp3 files. The bot downloads all of the files on startup of a new build.

# Release Notes

### v1.2.0

- Upgraded to discord.js v14.
- Support for SQL CA SSL.
- Refactored code.

### v1.1.1

- Bug fix to greetings of `type` file not playing.
- Updated the README to include updates to greeting functionality

### v1.1.0

- Greeting command now supports categories. Now you can set your greeting to a category and a random file from that category will be played upon entering a discord channel.

### v1.0.0

- GitHub is now public and a README has been written. Arbitrarily calling this release v1.0.0, now that everything is setup.
- Added farewells. Farewells are the same as greetings, except the clip is played on exit of a discord guild instead of entry.
- Added new categories: `playhistory` and `uploadhistory`.
- Various bug fixes and code improvements.
