/* eslint-disable no-undef */
// Mock browser APIs that aren't available in Node.js
global.File = class File {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(fileBits, fileName, options) {
        this.name = fileName;
        this.size = 0;
        this.type = options?.type || '';
        this.lastModified = Date.now();
        this.webkitRelativePath = '';
    }

    arrayBuffer() {
        return Promise.resolve(new ArrayBuffer(0));
    }

    text() {
        return Promise.resolve('');
    }

    stream() {
        return new ReadableStream();
    }

    slice() {
        return new File([], this.name, {type: this.type});
    }
};

// Mock FileReader if needed
global.FileReader = class FileReader {
    constructor() {
        this.readyState = 0;
        this.result = null;
        this.error = null;
    }

    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {}
    abort() {}
    readAsArrayBuffer() {}
    readAsDataURL() {}
    readAsText() {}
};

// Mock other File API related globals if needed
global.FileList = class FileList extends Array {
    item(index) {
        return this[index];
    }
};

global.Blob = class Blob {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(array, options) {
        this.size = 0;
        this.type = options?.type || '';
    }

    arrayBuffer() {
        return Promise.resolve(new ArrayBuffer(0));
    }

    text() {
        return Promise.resolve('');
    }

    stream() {
        return new ReadableStream();
    }

    slice() {
        return new Blob([], {type: this.type});
    }
};
