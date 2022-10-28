# Overview

This is a project of utils to modify ts files using ts-morph.

# How to use it
## Setup
1. yarn Or npm install
2. (Optional) copy .env.example and rename it to .env file at the root and fill in your own values. This file is required for some features.

## Run example

Examples are self contained files to play with ts-morph, output will be written to ./generated

```
yarn example partialexamplename
```

## Run feature

Features can be found at ./src/features/

```
yarn start -p=project//path -f=partialfeaturename
```
