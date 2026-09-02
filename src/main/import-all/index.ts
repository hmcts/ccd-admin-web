const fs = require("node:fs");
const path = require("node:path");

export const importAll = (importPath) => {
  return fs.readdirSync(importPath)
    .filter((fileName) => {
      return fileName.match(/\.(js|ts)$/);
    })
    .map((fileName) => {
      return require(path.join(importPath, fileName));
    })
    .filter((module) => {
      return module.__esModule;
    })
    .map((module) => {
      return module.default;
    });
};
