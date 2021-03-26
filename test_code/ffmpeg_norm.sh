#!/bin/bash
ffmpeg -i $1 -af loudnorm=I=-16:LRA=11:TP=-1.5 "${1%.mp3}_norm.mp3"