const fs = require('fs');
const path = require('path');

const getAllFiles = function(dirPath ?: any, arrayOfFiles ?: any) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, file));
    }
  });

  return arrayOfFiles;
};

export const getTotalSize = function(directoryPath: string) {
  const arrayOfFiles = getAllFiles(directoryPath);

  let totalSize = 0;

  arrayOfFiles.forEach(function(filePath) {
    totalSize += fs.statSync(filePath).size;
  });

  return totalSize;
};
