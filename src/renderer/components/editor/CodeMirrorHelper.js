
class CodeMirrorHelper {
	static wrapSelection(cm, wrapChar, wrapCharAfter, adjustPosition = 0) {
		let doc = cm.getDoc()
		let selection = doc.getSelection()
		let cursor = doc.getCursor()
		if (!wrapCharAfter) {
			wrapCharAfter = wrapChar
		}

		doc.replaceSelection(`${wrapChar}${selection}${wrapCharAfter}`)

		let endCharPos = cursor.ch + wrapChar.length
		let startCharPos = endCharPos - selection.length
		if (adjustPosition > 0) {
			doc.setSelection({ line: cursor.line, ch: endCharPos + adjustPosition })
		} else if (adjustPosition < 0) {
			doc.setSelection({ line: cursor.line, ch: startCharPos + adjustPosition })
		} else {
			doc.setSelection({ line: cursor.line, ch: endCharPos }, { line: cursor.line, ch: startCharPos })
		}
		
		cm.refresh()
		cm.focus()
	}

	static coverLine(cm, coverText) {
		let doc = cm.getDoc()
		let cursor = doc.getCursor()
		let pos = {
			line: cursor.line,
			ch: 0
		}
		doc.replaceRange(`${coverText} `, pos, pos)
	}

	static bold(cm) {
		CodeMirrorHelper.wrapSelection(cm, '**')
	}

	static italic(cm) {
		CodeMirrorHelper.wrapSelection(cm, '*')
	}

	static underline(cm) {
		CodeMirrorHelper.wrapSelection(cm, '_')
	}

	static link(cm) {
		CodeMirrorHelper.wrapSelection(cm, '[', ']()', 2)
	}

	static header2(cm) {
		CodeMirrorHelper.coverLine(cm, '##')
	}

	static header3(cm) {
		CodeMirrorHelper.coverLine(cm, '###')
	}
}

export default CodeMirrorHelper
