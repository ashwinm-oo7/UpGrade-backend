// src/searchEngine/fuseStore.js
let fuseInstance = null;
let docs = [];

export function setFuse(fuse, allDocs) {
  fuseInstance = fuse;
  docs = allDocs;
}

export function getFuse() {
  return fuseInstance;
}

export function getDocs() {
  return docs;
}
