# Audio Testing commands

Some FFMPEG commands used for generating, playing, and analyzing audio signals.

```bash
ffmpeg -f lavfi -i "sine=frequency=440:duration=10:sample_rate=44100,volume=0.5,afade=t=out:st=5:d=5" -c:a libmp3lame -b:a 192k test_varying_loudness.mp3
ffmpeg -f lavfi -i "sine=frequency=440:duration=3:sample_rate=44100,volume=0.2" -c:a libmp3lame -b:a 192k quiet.mp3
ffmpeg -f lavfi -i "sine=frequency=440:duration=3:sample_rate=44100,volume=0.8" -c:a libmp3lame -b:a 192k loud.mp3
```

```txt
file 'quiet.mp3'
file 'loud.mp3'
file 'quiet.mp3'
```

```bash
ffmpeg -f concat -safe 0 -i inputs.txt -c copy test_multiple_loudness.mp3
```

```bash
ffplay test_varying_loudness.mp3
# or
ffplay test_multiple_loudness.mp3
```

```bash
ffmpeg -i test_varying_loudness.mp3 -filter_complex ebur128 -f null -
ffmpeg -i test_varying_loudness_normalized.mp3 -filter_complex ebur128 -f null -
```

```txt
  Integrated loudness:
    I:         -29.3 LUFS
    Threshold: -39.8 LUFS

  Loudness range:
    LRA:         6.9 LU
    Threshold: -49.4 LUFS
    LRA low:   -34.9 LUFS
    LRA high:  -28.0 LUFS

normalized

  Integrated loudness:
    I:         -17.6 LUFS
    Threshold: -28.0 LUFS

  Loudness range:
    LRA:         6.1 LU
    Threshold: -37.7 LUFS
    LRA low:   -22.5 LUFS
    LRA high:  -16.4 LUFS
```
