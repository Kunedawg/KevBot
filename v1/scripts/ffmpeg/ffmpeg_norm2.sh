#!/bin/bash

# Run the load norm once to get the params. Remove newlines and spaces. Extra json from output
loud_norm_output=$(ffmpeg -hide_banner -i $1 -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1)
test_str=$(echo $loud_norm_output | tr -d '\n\r' | tr -d ' ')
regex='\[Parsed_loudnorm_0.*\]({.*})'
[[ $test_str =~ $regex ]]
echo "${BASH_REMATCH[1]}"

# Get duration of file
duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $1)
echo "org duration: $duration"

# If duration is less than 3 sec then pad clip

# ffmpeg -hide_banner -loglevel error -i $1 -af apad,atrim=0:3,loudnorm=I=-16:TP=-1.5:LRA=11,atrim=0:$duration "${1%.mp3}_norm.mp3"


# duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${1%.mp3}_norm.mp3")
# echo "norm duration: $duration"

#ffmpeg -i in.wav -af apad,atrim=0:3,loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=-23.54:measured_TP=-7.96:measured_LRA=0.00:measured_thresh=-34.17:offset=7.09:linear=true:print_format=summary,atrim=0:1.0 -ar 16k trimmed-out.wav
#ffmpeg -i ./test_audio/sonofabitch.mp3 -af apad,atrim=0:3,loudnorm=I=-16:LRA=11:TP=-1.5,atrim=0:2.53 ./test_audio/sonofabitch_3sec_norm_trim.mp3