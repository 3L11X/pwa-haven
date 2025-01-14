import JASSUB from 'jassub'
import { EventEmitter } from 'events'
import { toTS, videoRx, subRx } from '../../../shared/util.js'
import Parser from './parser.js'

const defaultHeader = `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default, Roboto Medium,26,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,0,0,0,0,100,100,0,0,1,1.3,0,2,20,20,23,1
[Events]

`
const stylesRx = /^Style:[^,]*/gm
export default class Subtitles extends EventEmitter {
  constructor (video, files, selected) {
    super()
    this.video = video
    this.selected = selected || null
    this.files = files || []
    this.headers = []
    this.tracks = []
    this._tracksString = []
    this._stylesMap = []
    this.fonts = ['/Roboto.ttf']
    this.renderer = null
    this.parsed = false
    this.stream = null
    if (selected[Symbol.asyncIterator]) {
      this.parser = new Parser(selected)
      this.parser.on('file', file => this.handleFile(file))
      this.parser.on('subtitle', ({ subtitle, trackNumber }) => this.handleSubtitle(subtitle, trackNumber))
      this.parser.on('tracks', tracks => this.handleTracks(tracks))
    }
    this.current = 0
    this.videoFiles = files.filter(file => videoRx.test(file.name))
    this.subtitleFiles = []
    this.timeout = null

    this.findSubtitleFiles(this.selected)
  }

  handleFile ({ data }) {
    this.fonts.push(data)
    this.renderer?.addFont(data)
  }

  handleSubtitle (subtitle, trackNumber) {
    if (this.selected) {
      const string = JSON.stringify(subtitle)
      if (this._tracksString[trackNumber] && !this._tracksString[trackNumber].has(string)) {
        this._tracksString[trackNumber].add(string)
        const assSub = this.constructSub(subtitle, this.headers[trackNumber].type !== 'ass', this.tracks[trackNumber].length, trackNumber)
        this.tracks[trackNumber].push(assSub)
        if (this.current === trackNumber) this.renderer?.createEvent(assSub)
      }
    }
  }

  handleTracks (arr) {
    if (this.selected) {
      for (const track of arr) {
        if (!this.tracks[track.number]) {
          // overwrite webvtt or other header with custom one
          if (track.type !== 'ass') track.header = defaultHeader
          this.tracks[track.number] = []
          this._tracksString[track.number] = new Set()
          this.headers[track.number] = track
          this._stylesMap[track.number] = {
            Default: 0
          }
          const styleMatches = track.header.match(stylesRx)
          for (let i = 0; i < styleMatches.length; ++i) {
            const style = styleMatches[i].replace('Style:', '').trim()
            this._stylesMap[track.number][style] = i + 1
          }

          this.emit('track-change')
        }
      }
      if (!this.current) this.initSubtitleRenderer()
      const tracks = this.headers?.filter(t => t)
      if (tracks?.length) {
        if (tracks.length === 1) {
          this.selectCaptions(tracks[0].number)
        } else {
          const wantedTrack = tracks.find(({ language }) => {
            if (language == null) language = 'eng'
            return language === 'eng'
          })
          if (wantedTrack) return this.selectCaptions(wantedTrack.number)

          const englishTrack = tracks.find(({ language }) => language === null || language === 'eng')
          if (englishTrack) return this.selectCaptions(englishTrack.number)

          this.selectCaptions(tracks[0].number)
        }
      }
    }
  }

  async findSubtitleFiles (targetFile) {
    const videoName = targetFile.name.substring(0, targetFile.name.lastIndexOf('.')) || targetFile.name
    // array of subtitle files that match video name, or all subtitle files when only 1 vid file
    const subfiles = this.files.filter(file => {
      return !this.subtitleFiles.some(sub => { // exclude already existing files
        return sub.lastModified === file.lastModified && sub.name === file.name && sub.size === file.size
      }) && subRx.test(file.name) && (this.videoFiles.length === 1 ? true : file.name.includes(videoName))
    })
    if (subfiles.length) {
      this.parsed = true
      const length = this.headers.length
      for (const [i, file] of subfiles.entries()) {
        const index = i + length
        this.subtitleFiles[index] = file
        const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
        const subname = file.name.slice(0, file.name.lastIndexOf('.'))
        // sub name could contain video name with or without extension, possibly followed by lang, or not.
        const name = subname.includes(targetFile.name)
          ? subname.replace(targetFile.name, '')
          : subname.replace(targetFile.name.slice(0, targetFile.name.lastIndexOf('.')), '')
        this.headers[index] = {
          header: defaultHeader,
          language: name.replace(/[,._-]/g, ' ').trim() || 'Track ' + index,
          number: index,
          type
        }
        this.emit('track-change')
        this.tracks[index] = []
        const subtitles = await Subtitles.convertSubFile(file, type)
        if (type === 'ass') {
          this.headers[index].header = subtitles
        } else {
          this.headers[index].header += subtitles.join('\n')
        }
      }
      if (!this.current) {
        this.current = 0
        this.initSubtitleRenderer()
        this.selectCaptions(this.current)
        this.emit('track-change')
      }
    }
  }

  initSubtitleRenderer () {
    if (!this.renderer) {
      this.renderer = new JASSUB({
        video: this.video,
        subContent: defaultHeader,
        fonts: this.fonts,
        fallbackFont: 'roboto medium',
        availableFonts: {
          'roboto medium': './Roboto.ttf'
        },
        workerUrl: new URL('jassub/dist/jassub-worker.js', import.meta.url).toString(),
        wasmUrl: new URL('jassub/dist/jassub-worker.wasm', import.meta.url).toString(),
        modernWasmUrl: new URL('jassub/dist/jassub-worker-modern.wasm', import.meta.url).toString()
      })
    }
  }

  static async convertSubFile (file, type) {
    const srtRx = /(?:\d+\n)?(\S{9,12})\s?-->\s?(\S{9,12})(.*)\n([\s\S]*)$/i
    const srt = text => {
      const subtitles = []
      const replaced = text.replace(/\r/g, '')
      for (const split of replaced.split('\n\n')) {
        const match = split.match(srtRx)
        if (match) {
          // timestamps
          match[1] = match[1].match(/.*[.,]\d{2}/)[0]
          match[2] = match[2].match(/.*[.,]\d{2}/)[0]
          if (match[1].length === 9) {
            match[1] = '0:' + match[1]
          } else {
            if (match[1][0] === '0') {
              match[1] = match[1].substring(1)
            }
          }
          match[1].replace(',', '.')
          if (match[2].length === 9) {
            match[2] = '0:' + match[2]
          } else {
            if (match[2][0] === '0') {
              match[2] = match[2].substring(1)
            }
          }
          match[2].replace(',', '.')
          // create array of all tags
          const matches = match[4].match(/<[^>]+>/g)
          if (matches) {
            matches.forEach(matched => {
              if (/<\//.test(matched)) { // check if its a closing tag
                match[4] = match[4].replace(matched, matched.replace('</', '{\\').replace('>', '0}'))
              } else {
                match[4] = match[4].replace(matched, matched.replace('<', '{\\').replace('>', '1}'))
              }
            })
          }
          subtitles.push('Dialogue: 0,' + match[1].replace(',', '.') + ',' + match[2].replace(',', '.') + ',Default,,0,0,0,,' + match[4].replace(/\n/g, '\\N'))
        }
      }
      return subtitles
    }
    const subRx = /[{[](\d+)[}\]][{[](\d+)[}\]](.+)/i
    const sub = text => {
      const subtitles = []
      const replaced = text.replace(/\r/g, '')
      let frames = 1000 / Number(replaced.match(subRx)[3])
      if (!frames || isNaN(frames)) frames = 41.708
      for (const split of replaced.split('\n')) {
        const match = split.match(subRx)
        if (match) subtitles.push('Dialogue: 0,' + toTS((match[1] * frames) / 1000, 1) + ',' + toTS((match[2] * frames) / 1000, 1) + ',Default,,0,0,0,,' + match[3].replace('|', '\\N'))
      }
      return subtitles
    }
    const text = await file.text()
    const subtitles = type === 'ass' ? text : []
    if (type === 'ass') {
      return subtitles
    } else if (type === 'srt' || type === 'vtt') {
      return srt(text)
    } else if (type === 'sub') {
      return sub(text)
    } else {
      // subbers have a tendency to not set the extensions properly
      if (srtRx.test(text)) return srt(text)
      if (subRx.test(text)) return sub(text)
    }
  }

  constructSub (subtitle, isNotAss, subtitleIndex, trackNumber) {
    if (isNotAss === true) { // converts VTT or other to SSA
      const matches = subtitle.text.match(/<[^>]+>/g) // create array of all tags
      if (matches) {
        matches.forEach(match => {
          if (/<\//.test(match)) { // check if its a closing tag
            subtitle.text = subtitle.text.replace(match, match.replace('</', '{\\').replace('>', '0}'))
          } else {
            subtitle.text = subtitle.text.replace(match, match.replace('<', '{\\').replace('>', '1}'))
          }
        })
      }
      // replace all html special tags with normal ones
      subtitle.text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, '\\h').replace(/\n/g, '\\N')
    }
    return {
      Start: subtitle.time,
      Duration: subtitle.duration,
      Style: this._stylesMap[trackNumber][subtitle.style || 'Default'] || 0,
      Name: subtitle.name || '',
      MarginL: Number(subtitle.marginL) || 0,
      MarginR: Number(subtitle.marginR) || 0,
      MarginV: Number(subtitle.marginV) || 0,
      Effect: subtitle.effect || '',
      Text: subtitle.text || '',
      ReadOrder: 1,
      Layer: Number(subtitle.layer) || 0,
      _index: subtitleIndex
    }
  }

  async parseSubtitles () { // parse all existing subtitles for a file
    if (!this.parser || this.parsed) return
    await this.parser.parseSubtitles()
    this.parser.destroy()
    this.parsed = true
  }

  selectCaptions (trackNumber) {
    if (trackNumber != null) {
      this.current = Number(trackNumber)
      this.emit('track-change')
      if (this.headers) {
        this.renderer?.setTrack(this.current !== -1 ? this.headers[this.current].header.slice(0, -1) : defaultHeader)
        if (this.tracks[this.current]) {
          if (this.renderer) for (const subtitle of this.tracks[this.current]) this.renderer.createEvent(subtitle)
        }
      }
    }
  }

  destroy () {
    this.parser?.destroy()
    this.renderer?.destroy()
    this.files = null
    this.video = null
    this.selected = null
    this.tracks = null
    this.headers = null
    this.emit('track-change')
  }
}
