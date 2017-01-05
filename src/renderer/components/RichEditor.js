import React, { Component, PropTypes } from 'react'
import { ipcRenderer } from 'electron'
import Quill from 'quill'
import hljs from 'highlightjs'
import 'highlightjs/styles/monokai-sublime.css'
import 'quill/dist/quill.snow.css'

let quillInstance;

class RichEditor extends Component {

  constructor(props, context) {
    super(props, context)

    this.state = {
      value: props.value
    }
    this.handleFinishUploadFile = this.handleFinishUploadFile.bind(this)
  }

  componentWillMount() {
    ipcRenderer.on("finish-add-file", this.handleFinishUploadFile)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener("finish-add-file", this.handleFinishUploadFile)
  }

  handleFinishUploadFile(e, fileUrl) {
		console.log("finishUploadFile", fileUrl)
    let range = quillInstance.getSelection()
    quillInstance.insertEmbed(range.index, 'image', fileUrl)
	}

  componentDidMount() {
    const { container } = this.refs
		const { onImageHandler } = this.props
    const { value } = this.state

    let options = {
			placeholder: '글을 작성하세요...',
	    modules: {
				syntax: {
					highlight: (text) => {
			      let result = hljs.highlightAuto(text);
			      return result.value
					}
				},
				toolbar: {
					container: [
			      [{ header: [2, 3, false] }],
						['bold', 'italic', 'code', 'script'],
						[{ list: 'ordered'}, { list: 'bullet' }],
						[ 'blockquote', 'code-block', 'link', 'image'],
						['clean']
			    ],
					handlers: {
						image: () => {
		          let fileInput = this.container.querySelector('input.ql-image[type=file]');
		          if (fileInput == null) {
		            fileInput = document.createElement('input');
		            fileInput.setAttribute('type', 'file');
		            fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon, image/svg+xml');
		            fileInput.classList.add('ql-image');
		            fileInput.addEventListener('change', () => {
									let files = []
									for (let i = 0; i < fileInput.files.length ; i++) {
										files.push(fileInput.files.item(i))
									}
									onImageHandler(files)
		            });
		            this.container.appendChild(fileInput);
		          }
		          fileInput.click();
						}
					}
				}
	    },
	    theme: 'snow'
    }

    quillInstance = new Quill(container, options)
  }

  getContent() {
    return quillInstance.root.innerHTML
  }

  updateContent(value) {
    if (quillInstance) {
      quillInstance.setText(value)
    }
  }

  render() {
    const { value } = this.state

    return (
      <div className="Quill">
        <div ref="container" dangerouslySetInnerHTML={{__html:value}} />
      </div>
    )
  }
}

RichEditor.propTypes = {
  value: PropTypes.string.isRequired,
	onImageHandler: PropTypes.func.isRequired
}

export default RichEditor
