# Target Tap

# Android Closed testing
Please visit https://play.google.com/store/apps/details?id=com.ertong.targetap to join on **android** the closed testing program.
Please visit https://play.google.com/apps/testing/com.ertong.targetap to join on **web** the closed testing program.

## Minimalist endless tap game
Please see https://capacitorjs.com/docs/cordova for more information about Capacitor.

---

## Webpack config
````javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: './src/game.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  }
}


````
## Capacitor Setup
````bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android

````

## Install

```bash
npm install

npx webpack
```

## Sync Web → Android
````bash
npx cap copy android
npx cap sync android


````
