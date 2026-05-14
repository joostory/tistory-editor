
class CodeMirrorHelper {
  static wrapSelection(view, wrapChar, wrapCharAfter = wrapChar, adjustPosition = 0) {
    const { state } = view
    const result = state.changeByRange(range => {
      const selection = state.sliceDoc(range.from, range.to)
      const insert = `${wrapChar}${selection}${wrapCharAfter}`
      
      let newRange;
      if (range.empty) {
        const pos = range.from + wrapChar.length + adjustPosition
        newRange = { from: pos, to: pos }
      } else {
        const from = range.from
        const to = range.from + insert.length
        if (adjustPosition !== 0) {
           const pos = to + adjustPosition
           newRange = { from: pos, to: pos }
        } else {
           newRange = { from, to }
        }
      }

      return {
        range: newRange,
        changes: { from: range.from, to: range.to, insert }
      }
    })

    view.dispatch(state.update({
      changes: result.changes,
      selection: result.range,
      scrollIntoView: true
    }))
    view.focus()
  }

  static coverLine(view, coverText) {
    const { state } = view
    const result = state.changeByRange(range => {
      const line = state.doc.lineAt(range.from)
      const insert = `${coverText} `
      return {
        range: { 
          from: range.from + insert.length, 
          to: range.to + insert.length 
        },
        changes: { from: line.from, to: line.from, insert }
      }
    })

    view.dispatch(state.update({
      changes: result.changes,
      selection: result.range,
      scrollIntoView: true
    }))
    view.focus()
  }

  static insertImage(view, url, title = '') {
    if (url) {
      const { state } = view
      const insert = `![${title}](${url})\n\n`
      const spec = state.replaceSelection(insert)
      view.dispatch(state.update({
        ...spec,
        scrollIntoView: true
      }))
      view.focus()
    }
  }

  static bold(view) {
    CodeMirrorHelper.wrapSelection(view, '**')
  }

  static italic(view) {
    CodeMirrorHelper.wrapSelection(view, '*')
  }

  static underline(view) {
    CodeMirrorHelper.wrapSelection(view, '_')
  }

  static link(view) {
    CodeMirrorHelper.wrapSelection(view, '[', ']()', 2)
  }

  static header2(view) {
    CodeMirrorHelper.coverLine(view, '##')
  }

  static header3(view) {
    CodeMirrorHelper.coverLine(view, '###')
  }
}

export default CodeMirrorHelper
