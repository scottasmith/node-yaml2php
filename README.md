# yaml2php

Simple library to convert yaml configuration into PHP using [yaml-ast-parser](https://github.com/mulesoft-labs/yaml-ast-parser).

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):


```
$ npm install yaml2php
```

## Usage

Read from file:
```
import { fromFile } from 'yaml2php';

try {
  var php = fromFile('example.yml');
  console.log(php);
} catch (e) {
  console.log(e);
}
```

Read from string:
```
import { fromString } from 'yaml2php';

try {
  var php = fromString(`---
key1:
    - 1
    - 'Two'
    - false
`);

  console.log(php);
} catch (e) {
  console.log(e);
}
```
