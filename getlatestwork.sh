#!/bin/bash

rm -rf ./three
rm -rf ./wad-editor

git clone https://github.com/2lag/three
git clone https://github.com/2lag/wad-editor

cd ./three
rm ./readme.md
rm ./.gitignore

cd ..
cd ./wad-editor
rm ./README.md