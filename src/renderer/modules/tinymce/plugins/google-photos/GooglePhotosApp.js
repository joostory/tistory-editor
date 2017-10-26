import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import RaisedButton from 'material-ui/RaisedButton'
import Loading from '../../../../components/Loading'
import AlbumList from './AlbumList'
import PhotoList from './PhotoList'

class GooglePhotosApp extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			albums: null,
			initialized: false,
			selectedAlbum: null,
		}
	}

	componentWillMount() {
		ipcRenderer.on("receive-google-photos-albums", this.handleReceiveAlbums)
	}

	componentWillUnmount() {
		ipcRenderer.removeListener("receive-google-photos-albums", this.handleReceiveAlbums)
	}

	componentDidMount() {
		ipcRenderer.send('fetch-google-photos-albums', this.handleReceiveAlbums)
	}

	@autobind
	handleReceiveAlbums(e, data) {
		this.setState({
			initialized: true,
			albums: data
		})
	}

	@autobind
	handleRequestAuth() {
		ipcRenderer.send("request-google-photos-auth")
	}

	@autobind
	handleAlbumSelect(album) {
		this.setState({
			selectedAlbum: album
		})
	}

	@autobind
	handleAlbumDeselect() {
		this.setState({
			selectedAlbum: null
		})
	}

	@autobind
	handleDisconnect() {
		ipcRenderer.send("disconnect-google-photos-auth")
		this.setState({
			selectedAlbum: null,
			albums: null
		})
	}

	@autobind
	handleImageSelect(image) {
		const { editor } = this.props
		if (confirm('이미지를 삽입하시겠습니까?')) {
			editor.undoManager.transact(() => {
				const url = image['content'][0]['$']['src']
				editor.insertContent(`<img id="__photos_new" src="${url}" data-photos-src="${url}">`)
				let $img = editor.$('#__photos_new')
				$img.removeAttr('id')
				$img.on('load', e => {
					editor.nodeChanged()
					$img.off('load')
				})
			})
		}
	}

	render() {
		const { albums, initialized, selectedAlbum } = this.state

		if (!initialized) {
			return (
				<div className="google-photos-wrap">
					<div className="google-photos-cover">
						<Loading />
					</div>
				</div>
			)
		}

		if (!albums) {
			return (
				<div className="google-photos-wrap">
					<div className="google-photos-cover">
						<RaisedButton label="Google Photos 연결" primary={true} onClick={this.handleRequestAuth} />
					</div>
				</div>	
			)
		}

		if (selectedAlbum) {
			return (
				<PhotoList album={selectedAlbum} onBack={this.handleAlbumDeselect} onClick={this.handleImageSelect} onDisconnect={this.handleDisconnect} />
			)
		} else {
			return (
				<AlbumList albums={albums} onClick={this.handleAlbumSelect} onDisconnect={this.handleDisconnect} />
			)
		}
	}
}

export default GooglePhotosApp
