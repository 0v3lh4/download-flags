'use strict'

const request = require('request')
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const { baseURI, flagsURI } = require('./base-urls')

/**
 * Realiza o download das bandeiras de países no site da CIA. 
 * @param {function} callbackSuccess callback(filename, index) enviado com sucesso.
 */
const downloadFlags = (callbackSuccess) => {

    createDirectoryFlags();

    request(flagsURI, (err, res, body) => {
        if (successHtmlAllFlags(err, res)) {
            const flags = getFlagsURIArray(body)

            return (function downloadInternal(flagsInternal, counter) {
                const [head, ...tail] = flagsInternal
                const filename = `${head.countryName}.gif`

                request(head.uri)
                    .pipe(fs.createWriteStream(path.join('.', 'flags', filename), { encoding: 'binary' }))
                    .on('close', () => callbackSuccess(filename, counter))

                return tail.length === 0 ? true : downloadInternal(tail, (counter + 1))

            })(flags, 0)
        }
        else
            console.error(err, res.statusCode, res.statusMessage)
    })

}

/**
 * Verifica se a resposta da URL foi com sucesso.
 * @param {string} err Mensagem do erro de response
 * @param {object} res objeto de response
 */
function successHtmlAllFlags(err, res) {
    return !err && 200 === res.statusCode;
}

/**
 * Busca a URI dos bandeiras
 * [{uri: {string}, countryName: {string}}] 
 * @param {string} body conteúdo html
 */
function getFlagsURIArray(body) {
    const $ = cheerio.load(body)
    return $('img[id^=flagDialog2_]').toArray()
        .map((img) => ({ uri: `${baseURI}/${img.attribs.src.replace('../', '')}`, countryName: img.attribs.countryname }));
}

/**
 * Cria o diretório flags, se não existir
 */
function createDirectoryFlags() {
    if (!fs.existsSync(path.join('.', 'flags')))
        fs.mkdirSync(path.join('.', 'flags'));
}

module.exports = downloadFlags
