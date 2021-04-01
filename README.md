# kev-bot

kev-bot is a discord bot for playing custom audio clips. The bot utilzes the discord.js library, MySQL, Google Cloud Storage and Heroku. See below for more information.

##### Table of Contents  
[Audio Commands](#audio-commands)
[Category Commands](#category-commands)
[Greeting Commands](#greeting-commands)
[Upload Command](#upload-command)
[Help Command](#help-command)

## Commands

All commands to the bot are text commands. All commands can be sent in a text channel of a Discord Guild that the bot can see and select commands can be sent directly to the bot. All commands have the following basic syntax:
```
commandName!arg1 arg2 arg3...
```
Where `commandName` is the command you wish to envoke with the arguments of that command followed by the `!`. Here are some common example commands:
```
p!chump
pr!all
list!all
list!mostplayed
upload! (with .mp3 file attached)
setgreeting!foryourhealth
```
### Audio Commands

| Command     | Argument 1      | Argument 2           | Description                                                       | Example Usage    |
| :---------- | :----------     | :----------          | :----------                                                       | :----------      |
| `p`         | `audioClipName` | `none`               | Plays the given `audioClipName`                                   | `p!hellogov`     |
| `pr`        | `categoryName`  | `none`               | Plays a random clip from the given `categoryName`                 | `pr!all`         |
| `raid`      | `audioClipName` | `voiceChannelIndex`  | Plays the given `audioClipName` in the given `voiceChannelIndex`  | `raid!chump 3`   |

### Category Commands

The bot supports categories, which allows you to group audio clips into categories and then play a random clip from that category with the `pr!` command. It is also possible to list all of the clips in a certain category with the `list!` command. Categories can be created with the `newcategory!` command and clips can be added to a category with the `addtocat!` command. See the table below for more details and a full list of category commands.

Note there are are some specialized `categoryNames` that can be used with the `list!` command and the `pr!` command.

**most played has an additional arg that needs to be addressed**

**Change refs to you to be the user**

| Command       | Argument 1      | Argument (i+1)   | Description                                                         | Example Usage                                                |
| :----------   | :----------     | :----------      | :----------                                                         | :----------                                                  |
| `list`        | `categoryName`  | `none`           | The bot will DM you a list of everything in the given `categoryName`| `list!all`                                                   |
| `newcategory` | `categoryName`  | `none`           | Creates a new category with the given `categoryName`                | `newcategory!arnold`                                         |
| `delcategory` | `categoryName`  | `none`           | Deletes the category with the given `categoryName`                  | `delcategory!arnold`                                         |
| `addtocat`    | `categoryName`  | `audioClipNames` | Adds the given `audioClipNames` to the given `categoryName`         | `addtocat!arnold icetomeetyou whoisyourdaddy magicschoolbus` |
| `delfromcat`  | `categoryName`  | `audioClipNames` | Deletes the given `audioClipNames` from the given `categoryName`    | `delfromcat!arnold magicschoolbus`                           |
| `addcatsto`   | `audioClipName` | `categoryNames`  | Adds the given `audioClipName` to the given `categoryNames`         | `addcatsto!billions trump president smart`                   |
| `delcatsfrom` | `audioClipName` | `categoryNames`  | Removes the given `audioClipName` from the given `categoryNames`    | `delcatsfrom!billions smart`                                 |

Note there are are some specialized `categoryNames` that can be used with the `list!` command and the `pr!` command.

| `categoryName`        | Description                                                                           | Compatible with commmands   |
| :----------           | :----------                                                                           | :----------                 |
| `all`, `' '`          | All audio clips. Note providing no `categoryName` will be interpreted as `all`        | `list!`, `pr!`              |
| `mostplayed`          | The most played audio clips. Note you can request the amount, so top 5, 10, 54 etc... | `list!`, `pr!`              |
| `myuploads`           | The audio clips that the user has personally uploaded                                 | `list!`, `pr!`              |
| `categories`, `cats`  | Lists all the categories that have audio clips assigned to them                       | `list!`                     |
| `emptycats`           | List all the categoires that have no clips assigned                                   | `list!`                     |
| `allcats`             | Lists all categories whether empty or not                                             | `list!`                     |

![categories.gif](https://github.com/Kunedawg/kev-bot/blob/master/gifs/categories.gif)


### Greeting Commands

You can set an audio clip to be your greeting. The bot will play your greeting anytime you join a discord voice channel. It is not played when switching between voice channels in the same discord.

| command       | Argument 1      | Description                                                       | Example Usage           |
| :----------   | :----------     | :----------                                                       | :----------             |
| `setgreeting` | `audioClipName` | Sets the given `audioClipName` to be your greeting                | `setgreeting!hellogov`  |
| `delgreeting` | `none`          | Deletes/removes your greeting. No greeting will be played now     | `delgreeting!`          |
| `getgreeting` | `none`          | The bot will DM you your current greeting                         | `getgreeting!`          |

### Upload Command

| Command     | Special Arguments     | Description                                                                                                            | Example Usage            |
| :---------- | :----------           | :----------                                                                                                            | :----------              |
| `upload`    | `mp3 File`            | Uploads the attached mp3 file to the bot's google cloud storage. There are restrictions on the max length of the file  | `upload!` w/ mp3 attached|

![upload.gif](https://github.com/Kunedawg/kev-bot/blob/master/gifs/upload.gif)

### Help Command

| Command       | Argument 1     | Description                                                                                                            | Example Usage            |
| :----------   | :----------    | :----------                                                                                                            | :----------              |
| `help`        | `helpCategory` | The bot will DM you helpful info on all the commands. Currently the only `helpCategies` are {`kb`,`kevbot`,`kev-bot`}  | `help!kb`                |
