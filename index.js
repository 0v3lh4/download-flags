'use strict'

const downloadFlags = require('./download-flags')

downloadFlags((filename, index) => {
    console.log(`${index} Download do arquivo ${filename} concluído`)
})