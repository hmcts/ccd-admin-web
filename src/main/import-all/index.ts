import fs from "fs";
import path from "node:path";

export const importAll = (importPath) => {
  return fs.readdirSync(importPath)
    .filter((fileName) => {
      return fileName.match(/\.(js|ts)$/);
    })
    .map((fileName) => {
      return require(path.join(importPath, fileName)); // eslint-disable-line @typescript-eslint/no-require-imports
    })
    .filter((module) => {
      return module.__esModule;
    })
    .map((module) => {
      return module.default;
    });
};
