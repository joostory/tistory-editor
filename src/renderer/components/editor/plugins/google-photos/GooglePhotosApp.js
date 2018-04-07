import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import RaisedButton from 'material-ui/RaisedButton'
import Loading from '../../../Loading'
import AlbumList from './AlbumList'
import PhotoList from './PhotoList'
import { toOriginalUrl } from '../../../../modules/GooglePhotosHelper'

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
		const { onSelectImage } = this.props
		if (confirm('이미지를 삽입하시겠습니까?')) {
			const url = toOriginalUrl(image.content[0]['$']['src'])
			const filename = image.title[0]
			onSelectImage(url, filename)
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
