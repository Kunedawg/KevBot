README.md

# kev-bot

kev-bot is a discord bot for playing custom audio clips. The bot utilzes the discord.js library, MySQL, Google Cloud Storage and Heroku. See below for more information.

##### Table of Contents  
[Commands](#commands)  

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
### Audio commands

| command     | argument 1      | argument 2           | Description                                                       | Example Usage    |
| :---------- | :----------     | :----------          | :----------                                                       | :----------      |
| `p`         | `audioClipName` | `none`               | Plays the given `audioClipName`                                   | `p!hellogov`     |
| `pr`        | `categoryName`  | `none`               | Plays a random clip from the given `categoryName`                 | `pr!all`         |
| `raid`      | `audioClipName` | `voiceChannelIndex`  | Plays the given `audioClipName` in the given `voiceChannelIndex`  | `raid!chump 3`   |

### Category commands

Add list of specialzed categories here

| command       | argument 1      | argument (i+1)   | Description                                                         | Example Usage                                                |
| :----------   | :----------     | :----------      | :----------                                                         | :----------                                                  |
| `list`        | `categoryName`  | `none`           | The bot will DM you a list of everything in the given `categoryName`| `list!all`                                                   |
| `newcategory` | `categoryName`  | `none`           | Creates a new category with the given `categoryName`                | `newcategory!arnold`                                         |
| `delcategory` | `categoryName`  | `none`           | Deletes the category with the given `categoryName`                  | `delcategory!arnold`                                         |
| `addtocat`    | `categoryName`  | `audioClipNames` | Adds the given `audioClipNames` to the given `categoryName`         | `addtocat!arnold icetomeetyou whoisyourdaddy magicschoolbus` |
| `delfromcat`  | `categoryName`  | `audioClipNames` | Deletes the given `audioClipNames` from the given `categoryName`    | `delfromcat!arnold magicschoolbus`                           |
| `addcatsto`   | `audioClipName` | `categoryNames`  | Adds the given `audioClipName` to the given `categoryNames`         | `addcatsto!billions trump president smart`                   |
| `delcatsfrom` | `audioClipName` | `categoryNames`  | Removes the given `audioClipName` from the given `categoryNames`    | `delcatsfrom!billions smart`                                 |

### Greeting commands

You can set an audio clip to be your greeting. The bot will play your greeting anytime you join a discord voice channel. It is not played when switching between voice channels in the same discord.

| command       | argument 1      | Description                                                       | Example Usage           |
| :----------   | :----------     | :----------                                                       | :----------             |
| `setgreeting` | `audioClipName` | Sets the given `audioClipName` to be your greeting                | `setgreeting!hellogov`  |
| `delgreeting` | `none`          | Deletes/removes your greeting. No greeting will be played now     | `delgreeting!`          |
| `getgreeting` | `none`          | The bot will DM you your current greeting                         | `getgreeting!`          |

### <u>Other commands</u>
#### help
#### upload

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

```bash
pip install foobar
```

## Usage

```python
import foobar

foobar.pluralize('word') # returns 'words'
foobar.pluralize('goose') # returns 'geese'
foobar.singularize('phenomena') # returns 'phenomenon'
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)

