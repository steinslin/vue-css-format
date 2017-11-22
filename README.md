##vue-css-format
> vue-css-format is a tool that automatically format your css code, support css、less、scss and vue

#### usage
- install
```shell
npm install vue-css-format --save-dev
```

- write the following js file
```javascript
var format = require('vue-css-format');
var path = require('path')

format(path.resolve()) // the directory want to format
```

- run the js code
```shell
node index.js
```

#### case
> input 
```css
a {
    height: 10px;
    b{height:10px;}
}
```
> ouput
```css
a {
    height: 10px;

    b {
        height: 10px;
    }
}
```

#### feature
- base on [stylefmt](https://github.com/morishitter/stylefmt) that can work with [stylelint](https://stylelint.io/)

### License
The MIT License
