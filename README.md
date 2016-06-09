> I love [Quip](http://quip.com), but i just need it for individual. So i decided build one.

## Roadmaps:
- [] Supports composion mode.
- [] Supports copy/paste complex usecases:
  - [] Support multiple nodes.
  - [] Support internal clipboard.
  - [] Better parse HTML algorithm.
- [] Switches to (hamt)[https://github.com/mattbierner/hamt] instead of immutable-js
- [] Supports overtype mode (Press `insert` then type sth)
- [] Supports drag/drop

## Enchantments
- [] getCommonAttributes should be called when keyUp

## Issues

> Feel free to open.

## Getting started

```bash
npm install
```

### Running development server

```bash
npm start # Navigate to localhost:3000 to view the app
```

Start a local dev server and refresh file changes on the fly without reloading the page. Even with CSS.

### Deploy to production

```bash
npm run build
```

Compiles application to `dist` folder. You can just serve this folder and you are good to go.

### Linting

```bash
npm run lint
```

Linting using `eslint` with standard rules and React plugin.

```bash
npm run lint:fix
```

Fixes common issues ([Learn more](http://eslint.org/docs/user-guide/command-line-interface.html#fix)).

### Test

> Currently I haven't writen any testcases yet

```bash
npm run test
```

Uses [ava](https://github.com/sindresorhus/ava) as test runner and uses [enzyme](https://github.com/airbnb/enzyme)
for testing your React components easier.

## License

BSD-3-Clause
