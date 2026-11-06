const SAMPLES = {
  "Ode to Joy":
`title=Ode to Joy
author=Ludwig van Beethoven
bpm=112
ts=4,4
key=d

clef=t
instrument=choir
4f4 4f4 4g4 4a4
4a4 4g4 4f4 4e4
4d4 4d4 4e4 4f4
4f4. 4e8 4e2
4f4 4f4 4g4 4a4
4a4 4g4 4f4 4e4
4d4 4d4 4e4 4f4
4e4. 4d8 4d2
4e4 4e4 4f4 4d4
4e4 4f8 4g8 4f4 4d4
4e4 4f8 4g8 4f4 4e4
4d4 4e4 3a2
4f4 4f4 4g4 4a4
4a4 4g4 4f4 4e4
4d4 4d4 4e4 4f4
4e4. 4d8 4d2

clef=b
instrument=cello
[3d 3a]1
3d2 2a2
[3d 3a]1
3d2 2a2
[3d 3a]1
3d2 2a2
[3d 3a]1
2a2 3d2
2a2 3d2
2a2 3d2
2a2 3d2
3d2 2a2
[3d 3a]1
3d2 2a2
[3d 3a]1
2a2 [2d 3d]2`,

  "Für Elise":
`title=Für Elise
author=Ludwig van Beethoven
bpm=72
ts=3,8
key=am

clef=t
r4 5e16 5ds16
clef=b
r4.

clef=t
5e16 5ds16 5e16 4b16 5d16 5c16
clef=b
r4.

clef=t
4a8 r16 4c16 4e16 4a16
clef=b
2a16 3e16 3a16 r16 r8

clef=t
4b8 r16 4e16 4gs16 4b16
clef=b
2e16 3e16 3gs16 r16 r8

clef=t
5c8 r16 4e16 5e16 5ds16
clef=b
2a16 3e16 3a16 r16 r8

clef=t
5e16 5ds16 5e16 4b16 5d16 5c16
clef=b
r4.

clef=t
4a8 r16 4c16 4e16 4a16
clef=b
2a16 3e16 3a16 r16 r8

clef=t
4b8 r16 4e16 5c16 4b16
clef=b
2e16 3e16 3gs16 r16 r8

clef=t
4a4.
clef=b
[2a 3e 3a]4.`,

  "Minuet in G":
`title=Minuet in G
author=Christian Petzold
bpm=120
ts=3,4
key=g

clef=t
5d4 4g8 4a8 4b8 5c8
5d4 4g4 4g4
5e4 5c8 5d8 5e8 5f8
5g4 4g4 4g4
5c4 5d8 5c8 4b8 4a8
4b4 5c8 4b8 4a8 4g8
4f4 4g8 4a8 4b8 4g8
4a2.
5d4 4g8 4a8 4b8 5c8
5d4 4g4 4g4
5e4 5c8 5d8 5e8 5f8
5g4 4g4 4g4
5c4 5d8 5c8 4b8 4a8
4b4 5c8 4b8 4a8 4g8
4a4 4b8 4a8 4g8 4f8
4g2.

clef=b
[3g 3b]2 3a4
3b2.
4c2.
3b2.
3a2.
3g2.
3d2 3c4
3d2.
[3g 3b]2 3a4
3b2.
4c2.
3b2.
3a2.
3g2.
3d2.
[2g 3g]2.`,

  "Greensleeves":
`title=Greensleeves
author=traditional
bpm=96
ts=6,8
key=am

clef=t
instrument=flute
r4 r8 r4 4a8
5c4 5d8 5e8. 5f16 5e8
5d4 4b8 4g8. 4a16 4b8
5c4 4a8 4a8. 4gs16 4a8
4b4 4gs8 4e4 4a8
5c4 5d8 5e8. 5f16 5e8
5d4 4b8 4g8. 4a16 4b8
5c8. 4b16 4a8 4gs8. 4fs16 4gs8
4a2.
5g4. 5g8. 5fs16 5e8
5d4 4b8 4g8. 4a16 4b8
5c4 4a8 4a8. 4gs16 4a8
4b4 4gs8 4e4.
5g4. 5g8. 5fs16 5e8
5d4 4b8 4g8. 4a16 4b8
5c8. 4b16 4a8 4gs8. 4fs16 4gs8
4a2.

clef=b
instrument=guitar
r2.
2a4. 3e4.
2g4. 3d4.
2a4. 3e4.
2e4. 2b4.
2a4. 3e4.
2g4. 3d4.
2a4. 2e4.
2a2.
3c4. 3g4.
2g4. 3d4.
2a4. 3e4.
2e4. 2b4.
3c4. 3g4.
2g4. 3d4.
2a4. 2e4.
[2a 3e]2.`,

  "Flight of the Bumblebee":
`title=Flight of the Bumblebee
author=Nikolai Rimsky-Korsakov
bpm=150
ts=2,4
key=am

clef=t
instrument=violin
6e16 6ds16 6d16 6cs16 6d16 6cs16 6c16 5b16
6c16 5b16 5bb16 5a16 5gs16 5g16 5fs16 5f16
5e16 5ds16 5d16 5cs16 5d16 5cs16 5c16 4b16
5c16 4b16 4bb16 4a16 4gs16 4g16 4fs16 4f16
4e16 4ds16 4d16 4cs16 4c16 4f16 4e16 4ds16
4e16 4ds16 4d16 4cs16 4c16 4cs16 4d16 4ds16
5e16 5ds16 5d16 5cs16 5c16 5f16 5e16 5ds16
5e16 5ds16 5d16 5cs16 5c16 5cs16 5d16 5ds16
5e16 5ds16 5d16 5cs16 5c16 5f16 5e16 5ds16
5e16 5ds16 5d16 5cs16 5d16 5cs16 5c16 4b16
5c16 4b16 4bb16 4a16 4gs16 4g16 4fs16 4f16
4e16 4f16 4fs16 4g16 4gs16 4a16 4bb16 4b16
5a16 5gs16 5g16 5fs16 5f16 5bb16 5a16 5gs16
5a16 5gs16 5g16 5fs16 5f16 5fs16 5g16 5gs16
5a16 5gs16 5g16 5fs16 5f16 5bb16 5a16 5gs16
5a16 5gs16 5g16 5fs16 5g16 5fs16 5f16 5e16
5f16 5e16 5ds16 5d16 5cs16 5c16 4b16 4bb16
4a16 4bb16 4b16 5c16 5cs16 5d16 5ds16 5e16
5e16 5ds16 5d16 5cs16 5c16 5f16 5e16 5ds16
5e16 5ds16 5d16 5cs16 5c16 5cs16 5d16 5ds16
5e16 5ds16 5d16 5cs16 5c16 5f16 5e16 5ds16
5e16 5ds16 5d16 5cs16 5d16 5cs16 5c16 4b16
5c16 4b16 4bb16 4a16 4gs16 4g16 4fs16 4f16
4e16 4f16 4fs16 4g16 4gs16 4a16 4b16 5c16
[4a 5c 5e 5a]4 r4

clef=b
r2
r2
r2
r2
2e8 r8 2e8 r8
2e8 r8 2e8 r8
2e8 [3d 3gs 3b]8 2e8 [3d 3gs 3b]8
2e8 [3d 3gs 3b]8 2e8 [3d 3gs 3b]8
2e8 [3d 3gs 3b]8 2e8 [3d 3gs 3b]8
2a8 [3c 3e 3a]8 2e8 [3d 3gs 3b]8
2a8 [3c 3e 3a]8 2e8 [3d 3gs 3b]8
2e4 3e4
2a8 [3c 3e 3a]8 2a8 [3c 3e 3a]8
2a8 [3c 3e 3a]8 2a8 [3c 3e 3a]8
2a8 [3c 3e 3a]8 2a8 [3c 3e 3a]8
2a8 [3c 3e 3a]8 2a8 [3c 3e 3a]8
2d8 [3d 3f 3a]8 2e8 [3d 3gs 3b]8
2e4 3e4
2e8 [3d 3gs 3b]8 2e8 [3d 3gs 3b]8
2e8 [3d 3gs 3b]8 2e8 [3d 3gs 3b]8
2e8 [3d 3gs 3b]8 2e8 [3d 3gs 3b]8
2a8 [3c 3e 3a]8 2e8 [3d 3gs 3b]8
2a8 [3c 3e 3a]8 2e8 [3d 3gs 3b]8
2e4 3e4
[1a 2a]4 r4`,

  "Korobeiniki (the Tetris theme)":
`title=Korobeiniki (the Tetris theme)
author=traditional Russian
bpm=150
ts=4,4
key=am

clef=t
instrument=chiptune
5e4 4b8 5c8 5d4 5c8 4b8
4a4 4a8 5c8 5e4 5d8 5c8
4b4. 5c8 5d4 5e4
5c4 4a4 4a2
5d4. 5f8 5a4 5g8 5f8
5e4. 5c8 5e4 5d8 5c8
4b4 4b8 5c8 5d4 5e4
5c4 4a4 4a4 r4
5e2 5c2
5d2 4b2
5c2 4a2
4gs2 4b2
5e2 5c2
5d2 4b2
5c4 5e4 5a2
5gs1
5e4 4b8 5c8 5d4 5c8 4b8
4a4 4a8 5c8 5e4 5d8 5c8
4b4. 5c8 5d4 5e4
5c4 4a4 4a2
5d4. 5f8 5a4 5g8 5f8
5e4. 5c8 5e4 5d8 5c8
4b4 4b8 5c8 5d4 5e4
5c4 4a4 [4a 5c 5e 5a]2

clef=b
instrument=chiptune
2e8 3e8 2e8 3e8 2e8 3e8 2e8 3e8
2a8 3a8 2a8 3a8 2a8 3a8 2a8 3a8
2gs8 3gs8 2gs8 3gs8 2gs8 3gs8 2gs8 3gs8
2a8 3a8 2a8 3a8 2a8 3a8 2a8 3a8
2d8 3d8 2d8 3d8 2d8 3d8 2d8 3d8
2c8 3c8 2c8 3c8 2c8 3c8 2c8 3c8
2b8 3b8 2b8 3b8 2e8 3e8 2e8 3e8
2a8 3a8 2a8 3a8 2a4 r4
2a8 3a8 2a8 3a8 2a8 3a8 2a8 3a8
2gs8 3gs8 2gs8 3gs8 2gs8 3gs8 2gs8 3gs8
2a8 3a8 2a8 3a8 2a8 3a8 2a8 3a8
2e8 3e8 2e8 3e8 2e8 3e8 2e8 3e8
2a8 3a8 2a8 3a8 2a8 3a8 2a8 3a8
2gs8 3gs8 2gs8 3gs8 2gs8 3gs8 2gs8 3gs8
2a8 3a8 2a8 3a8 2a8 3a8 2a8 3a8
2e8 3e8 2e8 3e8 2e8 3e8 2e8 3e8
2e8 3e8 2e8 3e8 2e8 3e8 2e8 3e8
2a8 3a8 2a8 3a8 2a8 3a8 2a8 3a8
2gs8 3gs8 2gs8 3gs8 2gs8 3gs8 2gs8 3gs8
2a8 3a8 2a8 3a8 2a8 3a8 2a8 3a8
2d8 3d8 2d8 3d8 2d8 3d8 2d8 3d8
2c8 3c8 2c8 3c8 2c8 3c8 2c8 3c8
2b8 3b8 2b8 3b8 2e8 3e8 2e8 3e8
2a8 3a8 2a8 3a8 [1a 2a]2`,

  "Boogie in C (Claude original)":
`title=Boogie in C
author=Claude Opus 5.5 - Medium
bpm=132
ts=4,4
key=c

clef=t
[4e 4g 5c]4 r8 4g8 4bb8 4g8 5c4
5eb8 5e8 5c8 4a8 4g4 r4
[4e 4g 5c]4 r8 4g8 4bb8 4g8 5c4
5eb8 5e8 5g8 5e8 [4bb 5c 5e]2
[4f 4a 5c]4 r8 5c8 5eb8 5c8 4a4
5eb8 5d8 5c8 4a8 [4f 4a 5c]2
[4e 4g 5c]4 r8 4g8 4bb8 4g8 5c4
5eb8 5e8 5c8 4a8 4g2
[4g 4b 5d]4 r8 5d8 5f8 5d8 4b4
5c8 5eb8 5c8 4a8 [4f 4a 5c]2
5g8 5e8 5eb8 5c8 4bb8 4g8 4e8 4c8
[4f 4b 5d]2 [4g 4b 5d 5f]2
[4e 4g 4bb 5c]1

clef=b
2c8 2e8 2g8 2a8 2bb8 2a8 2g8 2e8
2c8 2e8 2g8 2a8 2bb8 2a8 2g8 2e8
2c8 2e8 2g8 2a8 2bb8 2a8 2g8 2e8
2c8 2e8 2g8 2a8 2bb8 2a8 2g8 2e8
2f8 2a8 3c8 3d8 3eb8 3d8 3c8 2a8
2f8 2a8 3c8 3d8 3eb8 3d8 3c8 2a8
2c8 2e8 2g8 2a8 2bb8 2a8 2g8 2e8
2c8 2e8 2g8 2a8 2bb8 2a8 2g8 2e8
2g8 2b8 3d8 3e8 3f8 3e8 3d8 2b8
2f8 2a8 3c8 3d8 3eb8 3d8 3c8 2a8
2c8 2e8 2g8 2a8 2bb8 2a8 2g8 2e8
2g8 2b8 3d8 3f8 2g2
[1c 2c]1`,

  "Showcase Shuffle (Claude original)":
`title=Showcase Shuffle
author=Claude Opus 5.5 - Medium
bpm=112
ts=4,4
key=f

clef=t
instrument=trumpet
| 5c8- 5d8- 5c8 4a8 4f4* 4g4*
| 4a4> {4b8 5c8 5d8} 5c4_ 4a4_
g5cs 5d4 5c8- 4b8- 4a8 4g8 4f4 ||
4a4 5c4~ 5c8 4bn8- 5c8 5d8
5f4> 5e4\\ 5d4/ {5c8 4b8 4a8}
4g4. 4a8 [4e 4g 5c]2 ||
5c8* 5css8* 5e8* 5f8* {5g8 5a8 5b8} 6c4>
5d4\\ 5eb4/ [4a 5c 5f]2^

clef=b
instrument=trombone
| 3f8 3c8 3a8 3c8 3f8 3c8 3a8 3c8
| 2b8 3f8 3d8 3f8 2b8 3f8 3d8 3f8
3c8 3g8 3e8 3g8 2f8 3c8 3a8 3c8 ||
2d8 3a8 3f8 3a8 2g4 3g4
2b4* 2a4* 2g4* 3c4*
3c4 2e4 2f2 ||
2d4 2a4 2g4 3c4
3c4 3c4 [2f 3c 3f]2^`,

  "Night Walk (Claude original)":
`title=Night Walk
author=Claude Opus 5.5 - Medium
bpm=93
ts=12,8
key=dm

clef=t
instrument=muted trumpet
r4. 5d4. 5f4 5e8 5d4.
5d8 5c8 4b8 5d4. 5f8 5e8 5d8 5c4.
4b4 4a8 4g4. 4b8 5d8 5g8 5f4 5e8
5e4. 5cs4 4a8 4a2.
r8 5a8 5f8 5d8 5e8 5f8 5g8 5f8 5e8 5d4.
5c8 5d8 5c8 4a4. 5c16 5d16 5f8 5g8 5f4.
5e8 5f8 5g8 6c4. 5b8 5a8 5g8 5e4.
5g4 5f8 5e4 5d8 5cs2.
[4f 5d]4. 5d8 5f8 5b8 5a4. 5g8 5f8 5d8
5d8 5b8 5a8 5g4 5f8 5e8 5f8 5g8 5d4.
5a8 5g16 5f16 5e8 5f4. 5a8 6c8 5b8 5a4.
5gs8 5a8 5bn8 6c4 5bn8 5a4. 5e4 5cs8
5d8 5f8 5a8 6d4. 6c8 5b8 5a8 5g8 5f8 5e8
5f4. 5d8 5c8 4b8 [4f 4b 5d]2.
4b8 5d8 5g8 5f8 5e8 5d8 5cs4. 5e4.
[4a 5d 5f]1.

clef=b
instrument=upright bass
2d8 2a8 3d8 3f8 3d8 2a8 2d8 2a8 3d8 3f8 3d8 2a8
1b8 2f8 2b8 3d8 2b8 2f8 1b8 2f8 2b8 3d8 2b8 2f8
2g8 3d8 3g8 3b8 3g8 3d8 2g8 3d8 3g8 3b8 3g8 3d8
2a8 3e8 3a8 4cs8 3a8 3e8 2a4. [2a 3e]4.
2d8 2a8 3d8 3f8 3d8 2a8 2d8 2a8 3d8 3f8 3d8 2a8
2f8 3c8 3f8 3a8 3f8 3c8 2f8 3c8 3f8 3a8 3f8 3c8
2c8 2g8 3c8 3e8 3c8 2g8 2c8 2g8 3c8 3e8 3c8 2g8
2a8 3e8 3g8 4cs8 3g8 3e8 2a4. [2a 3g]4.
1b8 2f8 2b8 3d8 2b8 2f8 1b8 2f8 2b8 3d8 2b8 2f8
2g8 3d8 3g8 3b8 3g8 3d8 2g8 3d8 3g8 3b8 3g8 3d8
2f8 3d8 3f8 3a8 3f8 3d8 2f8 3c8 3f8 3a8 3f8 3c8
2e8 2bn8 3e8 3gs8 3e8 2bn8 2a8 3e8 3a8 4cs8 3a8 3e8
2d8 2a8 3d8 3f8 3d8 2a8 2d8 2a8 3d8 3f8 3d8 2a8
1b4. 2f4. [1b 2f 2b]2.
2g8 3d8 3g8 3b8 3g8 3d8 2a8 3e8 3a8 4cs8 3a8 3e8
[1d 2a 2d]1.`,

  "Smoke (Claude original)":
`title=Smoke
author=Claude Opus 5.5 - Medium
bpm=92
key=cm

clef=t
instrument=sax
(r4 r8 [4e 4g 4b]8* r4 [4e 4g 4b]8* r8)x3 r2 r8 4g8 4b8 5c8
5e4> 5c8 4b8 5c4. r8 5f8 5gb8 5f8 5e8 5c4\\ r4
r8 4g8 4b8 5c8 5e8 5c8 4b8 4g8~ 4g2 r4 g5f 5gb8 5g8
5a4> 5f8 5e8 5f4. r8 5c8 5e8 5f8 5gb8 5f4\\ r4
r8 5c8 5e8 5g8 {5b8 5a8 5g8} 5f8 5e8 5c2~ 5c4 r4
5c4> 5e8 5gb8~ 5gb4 5e8 5c8 4bn4> 5d8 5f8~ 5f4 5d8 4bn8
5c8 4g8 5e8 5c8 4bn8 5d8 5f8 5a8 5g4 r8 4g8 4bn8 5d8 5f8 5d8
5c16 5e16 5f16 5gb16 5g8 5e8 5c8 4b8 4g8 r8 {5f8 5a8 6c8} 5b8 5a8 5f4\\ r4
r16 5g16 5gb16 5f16 5e8 5c8 5e8 5f8 5gb8 5g8 5b4> 5g8 5e8 5c2
5f16 5a16 6c16 6e16 6f8 6e8 6c8 5a8 5f8 r8 6c4\\ r8 5a8 {5b8 5a8 5f8} 5e8 5c8
(5c16 5e16 5g16 5e16)x2 5c8 4b8 4g8 4b8 5c4 r4 r8 5c8 5e8 5gb8
5gb4> 5e8 5c8 4a8 5c8 5e8 5gb8 5f4> 5d8 4bn8 4g8 4bn8 5d8 5f8
{5e8 5d8 5c8}x2 {5d8 5c8 4bn8}x2 5c4 r4 r8 4g8 4b8 5c8
5e4> 5c8 4b8 5c4. r8 5f8 5gb8 5f8 5e8 5c4\\ r4
r8 4g8 4b8 5c8 5e8 5c8 4b8 4g8~ 4g2 r4 g5f 5gb8 5g8
5a4> 5f8 5e8 5f4. r8 5c8 5e8 5f8 5gb8 5f4\\ r4
r8 5c8 5e8 5g8 {5b8 5a8 5g8} 5f8 5e8 5c2~ 5c4 r4
5c4> 5e8 5gb8~ 5gb4 5e8 5c8 4bn4> 5d8 5f8~ 5f4 5d8 4bn8
5c8 4g8 5e8 5c8 4bn8 5d8 5f8 5a8 5g4 r8 4g8 4bn8 5d8 5f8 5d8
r4 [4e 4g 4b 5d]2.~ [4e 4g 4b 5d]1

clef=b
instrument=upright bass
(2c8. 2c16 3c8 2b8 2g8 2f8 2g8 2b8)x4
(2c8. 2c16 3c8 2b8 2g8 2f8 2g8 2b8
2f8. 2f16 3f8 3e8 3c8 2b8 3c8 3e8
(2c8. 2c16 3c8 2b8 2g8 2f8 2g8 2b8)x2
(2f8. 2f16 3f8 3e8 3c8 2b8 3c8 3e8)x2
(2c8. 2c16 3c8 2b8 2g8 2f8 2g8 2b8)x2
2a8. 2a16 3a8 3gb8 3e8 3c8 3e8 3gb8
2g8. 2g16 3g8 3f8 3d8 2bn8 3d8 3f8
2c8. 2c16 3c8 2b8 2g8. 2g16 3g8 3f8
2c4 r8 2c8 2g4 2bn4)x3
2g4 2bn4 2c2~ 2c1`,

  "Magnum Opus: Fanfare (Claude original)":
`title=Claude's Magnum Opus: Fanfare
author=Claude Opus 5.5 - Medium
bpm=108
ts=4,4
key=d

clef=t
instrument=trumpet
r2 r8 4a8 5d8 5e8
5f4. 5e8 5d4 5a4>
5g8 5f8 5e8 5d8 5e2
{5d8 5e8 5f8} 5g4 5a2~
5a2 r8 5a8 5b8 6c8
6d4> 5a4 5f4 5d4
5e8 5f8 5g8 5e8 5c4 5a4
5d2. r4
r8 4a8 5d8 5f8 5a4. 5g8
5f8 5e8 5d8 5e8 5f4 5d4
5g4. 5f8 5e4 5b4
5a8 5g8 5f8 5e8 5d4 r4
[5d 5f 5a]4> r8 [5d 5f 5a]8 [5e 5g 5b]4> r8 [5e 5g 5b]8
[5f 5a 6d]2> {5a8 5b8 6c8} 6d4
6e4 6c4 5a4 6e4
[5f 5a 6d]1

clef=b
instrument=strings
[2d 2a]1
[2d 2a]2 [2b 3f]2
[2g 3d]2 [2a 3e]2
[2g 3d]2 [2a 3e]2~
[2a 3e]2 [2a 3e 3g]2
[2d 2a]2 [2f 3d]2
[2g 3d]2 [2a 3e]2
[2d 2a 3d]2. r4
[2d 2a]1
[2f 3d]2 [2b 3f]2
[2e 2b 3g]2 [2g 3d]2
[2a 3e]2 [2a 3e]2
2d4 r8 2d8 2e4 r8 2e8
2f2 2a2
2a1
[1d 2a 2d]1`,

  "Magnum Opus: Lo-fi Tokens (Claude original)":
`title=Claude's Magnum Opus: Lo-fi Tokens
author=Claude Opus 5.5 - Medium
bpm=80
ts=4,4
key=f

clef=t
instrument=electric piano
| r8 [4a 5c 5e]8~ [4a 5c 5e]4 r8 4g8 4a8 5c8
[4f 4a 5c 5e]2 r4 5d8 5c8
r8 [4f 4a 5c]8~ [4f 4a 5c]4 r8 5d8 5e8 5f8
5e4 5d8 5c8~ 5c2
r8 [4f 4b 5d]8~ [4f 4b 5d]4 r8 5d8 5f8 5g8
5a4. 5g8 5f8 5d8 5c4
r8 [4e 4b 5d]8~ [4e 4b 5d]4 r8 4b8 5c8 5d8
5c2. r4 ||
[4f 4a 5c 5e 5g]1

clef=b
instrument=upright bass
| 2f4 r8 2f8 3c4 3e4
3f4 3e4 3d4 3c4
2d4 r8 2d8 2a4 3c4
3d4 3c4 2a4 2g4
2g4 r8 2g8 3d4 3f4
3g4 3f4 3d4 2b4
2c4 r8 2c8 2g4 2b4
3c4 2b4 2a4 2g4 ||
[1f 2f]1`,

  "Magnum Opus: Final Boss (Claude original)":
`title=Claude's Magnum Opus: Final Boss
author=Claude Opus 5.5 - Medium
bpm=160
ts=4,4
key=em

clef=t
instrument=chiptune
(5e8 5b8 6e8 5b8 5g8 5b8 6e8 5b8)x2
(5c8 5g8 6c8 5g8 5e8 5g8 6c8 5g8)x2
(5d8 5a8 6d8 5a8 5f8 5a8 6d8 5a8)x2
(5b8 6ds8 6f8 6ds8)x4

(6e4> 6d8 5b8 5g4 5a8 5b8
5b4 5a8 5g8 5f4 5g8 5a8
5g4 5f8 5e8 5ds4 5f8 5b8
5e2. r4)x2

6c8 6c16 6d16 6e8 6c8 5g4 5a8 5b8
6d8 6d16 6e16 6f8 6d8 5a4 6d8 6f8
6g4. 6f8 6e8 6d8 5b8 6d8
6e16 6f16 6g16 6f16 6e16 6d16 5b16 6d16 6e2
6c8 6c16 6d16 6e8 6c8 6g4 6e8 6c8
6d8 6d16 6e16 6f8 6d8 6a4 6f8 6d8
6ds8 6f8 6b8 6f8 6ds8 6f8 5b8 6ds8
{6f8 6ds8 5b8} {6f8 6ds8 5b8} 6f2

[5a 6c 6e]2> r2
[5a 6c 6e]2> r4 6e8 6f8
6g2. 6e8 6d8
6ds2 6f4 6a4

[5e 6e]4> [5d 6d]8 [4b 5b]8 [4g 5g]4 [4a 5a]8 [4b 5b]8
[4b 5b]4 [4a 5a]8 [4g 5g]8 [4f 5f]4 [4g 5g]8 [4a 5a]8
[4g 5g]4 [4f 5f]8 [4e 5e]8 [4ds 5ds]4 [4f 5f]8 [4b 5b]8
[4e 5e]2. r4
[5e 6e]4> [5d 6d]8 [4b 5b]8 [4g 5g]4 [4a 5a]8 [4b 5b]8
[4b 5b]4 [4a 5a]8 [4g 5g]8 [4f 5f]4 [4g 5g]8 [4a 5a]8
[4g 5g]4 [4f 5f]8 [4e 5e]8 [4ds 5ds]4 [4f 5f]8 [4b 5b]8
{5e8 5f8 5g8} {5a8 5b8 6c8} {6d8 6ds8 6e8} 6ds4

(6e16 6b16 7e16 6b16)x4
(6c16 6g16 7c16 6g16)x4
(5b16 6ds16 6f16 6b16)x4
[5e 5b 6e]8> r8 [5e 5b 6e]8> r8 [5e 5g 5b 6e]2>

clef=b
instrument=chiptune
(2e8 3e8)x8
(2c8 3c8)x8
(2d8 3d8)x8
(2b8 3b8)x8

((2e8 3e8)x4 (2d8 3d8)x4 (2b8 3b8)x4 (2e8 3e8)x4)x2

(2c8 2c16 2c16)x4
(2d8 2d16 2d16)x4
(2e8 2e16 2e16)x8
(2c8 2c16 2c16)x4
(2d8 2d16 2d16)x4
(2b8 2b16 2b16)x8

2a1
2a1
2c1
2b16x16

(2e8 2e16 2e16)x4 (2d8 2d16 2d16)x4 (2b8 2b16 2b16)x4 (2e8 2e16 2e16)x4
(2e8 2e16 2e16)x4 (2d8 2d16 2d16)x4 (2b8 2b16 2b16)x8

(2e16 3e16)x8
(2c16 3c16)x8
(2b16 3b16)x8
[1e 2e]8> r8 [1e 2e]8> r8 [1e 2e]2>`,

  "Comet Cat (Claude original)":
`title=Comet Cat
author=Claude Opus 5.5 - Medium
bpm=184
ts=4,4
key=a

clef=t
instrument=muted trumpet
4a16 4as16 4b16 5cn16 5c16 5d16 5ds16 5e16 5fn16 5f16 5gn16 5g16 6a4>/
[5a 6c 6e]8> r8 [5a 6c 6e]8> r8 6e16 6f16 6g16 6a16 6g16 6f16 6e16 6c16
|||
6c16 6e16 6a16 6e16 6c16 6e16 6a16 6e16 5a8 6c8 6e8 6a8
6a8. 6g16 6f8 6c8 g5a 6c16 6f16 6a16 6f16 6c4
6d16 6f16 6a16 6d16 5a16 6d16 6f16 5a16 6d4\\ r8 6a8
6b16 6a16 6g16 6f16 6e16 6d16 6c16 5b16 {5g8 5b8 6e8} 6g4/
6e8 6c16 6e16 6a8 6e16 6a16 6c8 6e8 6a4>
6g16 6e16 6c16 6e16 6g16 6e16 6c16 6e16 6g8* 6g8* 6e8* 6c8*
6f16 6d16 5a16 6d16 6f16 6a16 6f16 6d16 6g16 6e16 5b16 6e16 6g16 6b16 6g16 6e16
[5a 6c 6e]8> r16 6a16 6g16 6f16 6e16 6d16 6c16 5b16 5a16 5g16 {5e8 5f8 5g8}
||||

clef=b
instrument=chiptune
(2a8 3a8)x4
[2a 3a]8> r8 [2a 3a]8> r8 2e8 3e8 2e8 3e8
|||
(2a8 3a8)x4
(2f8 3f8)x4
(2d8 3d8)x4
(2e8 3e8)x4
(2a8 3a8)x4
(2c8 3c8)x4
(2d8 3d8)x2 (2e8 3e8)x2
2a8 3a8 2a8 3a8 2e8 3e8 2e16 2f16 2g16 2e16
||||`,

  "Stairway Rag (Qwen original)":
`title=Stairway Rag
author=Qwen3.8-DavidAU-MTP-Q8-TT
bpm=140
ts=2,4
key=c

clef=t
instrument=piano
4c8 4g8 4c8 4g8
4e8 4c8 4e8 4c8
4f8 4c8 4f8 4c8
4g8 4g8 4g8 4g8
4c8 4g8 4c8 4g8
4e8 4c8 4e8 4c8
4f8 4c8 4f8 4c8
4g4 r4
4c8 4e8 4g8 4c8
4b8 4g8 4b8 4g8
4a8 4e8 4a8 4e8
4g8 4e8 4g8 4e8
4c8 4e8 4g8 4c8
4b8 4g8 4b8 4g8
4a8 4e8 4a8 4e8
4g4 r4

clef=b
instrument=piano
2c8 3g8 2c8 3g8
2c8 3g8 2c8 3g8
2c8 3g8 2c8 3g8
2c8 3g8 2c8 3g8
2e8 3c8 2e8 3c8
2e8 3c8 2e8 3c8
2c4 3g4
2c4 3g4
2d8 3a8 2d8 3a8
2d8 3a8 2d8 3a8
2d8 3a8 2d8 3a8
2d8 3a8 2d8 3a8
2f8 3c8 2f8 3c8
2f8 3c8 2f8 3c8
2d4 3a4
2d4 3a4
`,

  "Porteno Tango (Qwen original)":
`title=Porteno Tango
author=Qwen3.8-DavidAU-MTP-Q8-TT
bpm=116
ts=4,4
key=cm

clef=t
instrument=sax
5c4 5e4 5g4 5a4
5g4 5e4 5c4 5a4
5c4 5e4 5g4 5a4
5a2 r4 5a4
5d4 5f4 5a4 5bb4
5a4 5f4 5d4 5f4
5d4 5f4 5a4 5f4
5d2 r4 5d4
5g4 5bb4 5d4 5e4
5d4 5bb4 5g4 5e4
5g4 5bb4 5d4 5e4
5e2 r4 5e4
5a4 5c4 5e4 5f4
5e4 5c4 5a4 5f4
5a4 5c4 5e4 5f4
5f2 r4 5f4

clef=b
instrument=upright bass
3c4 3g4 3e4 3g4
3c4 3g4 3e4 3g4
3c4 3g4 3e4 3g4
3c4 3g4 3e4 3g4
3d4 3a4 3f4 3a4
3d4 3a4 3f4 3a4
3d4 3a4 3f4 3a4
3d4 3a4 3f4 3a4
3g4 3d4 3bb4 3d4
3g4 3d4 3bb4 3d4
3g4 3d4 3bb4 3d4
3g4 3d4 3bb4 3d4
3a4 3e4 3c4 3e4
3a4 3e4 3c4 3e4
3a4 3e4 3c4 3e4
3a4 3e4 3c4 3e4
`,
};

function isSampleOrEmpty( text ) {
  return !text.trim()
      || Object.values( SAMPLES ).includes( text );
}

function loadSample( name ) {
  if ( !isSampleOrEmpty( EDITOR.value )
    && !confirm(
         `Replace your music with "${ name }"?`
       )
  ) return;

  stopPlayback();
  PLAYBACK_POSITION = 0;
  EDITOR.value = SAMPLES[ name ];
  refreshScore();
  SCORE.scrollTop = 0;
  HELP.close();
}

SAMPLE_PICKER.replaceChildren(
  new Option( "choose a piece…", "" ),
  ...Object.keys( SAMPLES ).map( name => new Option( name, name ) )
);

SAMPLE_PICKER.addEventListener( "change",
  () => {
    if ( SAMPLE_PICKER.value )
      loadSample( SAMPLE_PICKER.value );
    SAMPLE_PICKER.value = "";
  }
);
