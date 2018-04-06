'use strict'

const request = require('request')
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const URIs = require('./base-urls')

const downloadFlags = (callbackSuccess) => {

    if(!fs.existsSync(path.join('.', 'flags')))
        fs.mkdirSync(path.join('.', 'flags'))

    request(URIs.flagsURI, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            const $ = cheerio.load(body)
            const flags = $('img[id^=flagDialog2_]').toArray()
                .map((img) => `${URIs.baseURI}/${img.attribs.src.replace('../', '')}`)

            return (function downloadInternal(flagsInternal, counter) {
                const [uri, ...uris] = flagsInternal
                const filename = path.basename(uri)

                request(uri)
                    .pipe(fs.createWriteStream(path.join('.', 'flags', filename), { encoding: 'binary' }))
                    .on('close', () => callbackSuccess(filename, counter))

                return uris.length === 0 ? true : downloadInternal(uris, (counter + 1))

            })(flags, 0)
        }
    })

}

module.exports = downloadFlags