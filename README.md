# SYNOPSIS

A collection of utility functions for 420coin. It can be used in Node.js and in the browser with [browserify](http://browserify.org/).

# INSTALL

`npm install fourtwentyjs-util`

# USAGE

```js
import assert from 'assert'
import { isValidChecksumAddress, unpadBuffer, BN } from 'fourtwentyjs-util'

const address = '0x2F015C60E0be116B1f0CD534704Db9c92118FB6A'
assert.ok(isValidChecksumAddress(address))

assert.equal(unpadBuffer(Buffer.from('000000006600', 'hex')), Buffer.from('6600', 'hex'))

assert.equal(new BN('dead', 16).add(new BN('101010', 2)), 57047)
```

# API

## Documentation

### Modules

- [account](docs/modules/_account_.md)
  - Account class
  - Private/public key and address-related functionality (creation, validation, conversion)
- [address](docs/modules/_address_.md)
  - Address class and type
- [bytes](docs/modules/_bytes_.md)
  - Byte-related helper and conversion functions
- [constants](docs/modules/_constants_.md)
  - Exposed constants
    - e.g. KECCAK256_NULL_S for string representation of Keccak-256 hash of null
- [hash](docs/modules/_hash_.md)
  - Hash functions
- [object](docs/modules/_object_.md)
  - Helper function for creating a binary object (`DEPRECATED`)
- [signature](docs/modules/_signature_.md)
  - Signing, signature validation, conversion, recovery
- [types](docs/modules/_types_.md)
  - Helpful TypeScript types
- [externals](docs/modules/_externals_.md)
  - Helper methods from `ethjs-util`
  - Re-exports of `BN`, `rlp`

### fourtwozerojs-util methods

The following methods are available provided by [fourtwozerojs-util](https://github.com/420integrated/fourtwozerojs-util):

- arrayContainsArray
- toBuffer
- getBinarySize
- stripHexPrefix
- isHexPrefixed
- isHexString
- padToEven
- intToHex
- fromAscii
- fromUtf8
- toUtf8
- toAscii
- getKeys

Import can be done directly by function name analogous to the build-in function import:

```js
import { intToHex, stripHexPrefix } from 'fourtwentyjs-util'
```

### Re-Exports

Additionally `fourtwentyjs-util` re-exports a few commonly-used libraries. These include:

- [BN.js](https://github.com/indutny/bn.js) (version `5.x`)
- [rlp](https://github.com/ethereumjs/rlp) (version `2.x`)

# FourtwentyJS

See our organizational [documentation](https://420integrated.com/wiki/fourtwentyjs) for an introduction to `FourtwentyJS` as well as information on current standards and best practices.

# LICENSE

MPL-2.0

[discord-badge]: https://img.shields.io/static/v1?logo=discord&label=discord&message=Join&color=blue
[discord-link]: https://discord.gg/TNwARpR
