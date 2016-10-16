
Nidarholm.js. A communication platform for symphonic bands and orchestras
=========================================================================
[![Build Status](https://img.shields.io/travis/strekmann/nidarholmjs.svg?style=flat-square)](https://travis-ci.org/strekmann/nidarholmjs)
[![Dependency Status](https://img.shields.io/david/strekmann/nidarholmjs.svg?style=flat-square)](/package.json)
[![Dev-dependency Status](https://img.shields.io/david/dev/strekmann/nidarholmjs.svg?style=flat-square)](/package.json)

This project is built on Node.js, Mongodb, Redis, Express, Ractive, ++

More information and documentation should arrive soon, and you are welcome to
request specific information by asking in a Github issue.

Built by Sigurd Gartmann and Jørgen Bergquist of Strekmann

License is AGPL

Implementation notes
====================

Permissions
-----------

Permission objects consists of three parts:

* Public: if the item is public to external viewers
* Groups: the viewer has to be member of one of these groups
* Users: the viewer has to be one of these users (not fully implemented, but
  simple to finish)

As soon as a permission object will be used client side, it is transformed to a
flat list of objects, where consisting of only `id` and `name`, the two fields
necessary for viewing or choosing. This makes handling a lot easier, and it
will never be a problem since the type is encoded in the id. The *public*
permission is hardcoded as a `p` in the `id` field.

This way of doing it is always up for discussion, but it seems flexible as soon
as it is worth the extra effort.
