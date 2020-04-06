#!/usr/bin/env node

require("@babel/register")({
  extensions: [".js", ".jsx", ".ts", ".tsx"],
});
require("@babel/polyfill");
require("./server/index");
