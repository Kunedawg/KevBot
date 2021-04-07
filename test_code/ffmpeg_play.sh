#!/bin/bash
for f in *.mp3; do ffplay -nodisp -autoexit "$f"; done