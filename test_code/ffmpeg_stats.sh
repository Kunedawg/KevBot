#!/bin/bash
ffmpeg -i $1 -af "volumedetect" -vn -sn -dn -f null NUL