#!/bin/bash

rm -rf ./three
rm -rf ./sheets
rm -rf ./wad-editor

git clone https://github.com/2lag/three
cd ./three
rm ./readme.md
rm ./.gitignore
rm -rf ./.git
cd ..

git clone https://github.com/2lag/sheets
cd ./sheets
rm ./local.sh
rm ./README.md
rm -rf ./.git
cd ..

git clone https://github.com/2lag/wad-editor
cd ./wad-editor
rm ./README.md
rm -rf ./.git
cd ..
