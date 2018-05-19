import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import update from 'immutability-helper'
import RaisedButton from 'material-ui/RaisedButton'
import Loading from '../../../Loading'
import PhotoList from './PhotoList'
import { toOriginalUrl } from '../../../../modules/GooglePhotosHelper'

class GooglePhotosApp extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			initialized: false,
			connected: false,
			images: [],
			fetching: false
		}
	}

	componentWillMount() {
		ipcRenderer.on("receive-google-photos-images", this.handleReceiveImages)
		ipcRenderer.on("start-fetch-google-photos-images", this.handleStartFetch)
		ipcRenderer.on("receive-google-connected", this.handleReceiveConnected)
	}

	componentWillUnmount() {
		ipcRenderer.removeListener("receive-google-photos-images", this.handleReceiveImages)
		ipcRenderer.removeListener("start-fetch-google-photos-images", this.handleStartFetch)
		ipcRenderer.removeListener("receive-google-connected", this.handleReceiveConnected)
	}

	componentDidMount() {
		this.handleRequestFetch(1)
	}

	@autobind
	handleReceiveImages(e, data) {
		const { images, fetching } = this.state
		if (data === null) {
			this.handleDisconnect()
			return
		}

		this.setState({
			initialized: true,
			connected: true,
			images: update(images, {
				$push: data
			}),
			fetching: false
		})
	}

	@autobind
	handleReceiveConnected(e, connected) {
		if (connected) {
			this.setState({
				initialized: true,
				connected: true
			})
		} else {
			this.setState({
				initialized: true,
				images: [],
				connected: false
			})
		}
		
	}

	@autobind
	handleStartFetch(e) {
		this.setState({
			fetching: true
		})
	}

	@autobind
	handleRequestFetch(startIndex) {
		ipcRenderer.send('fetch-google-photos-images', startIndex)
	}

	@autobind
	handleRequestAuth() {
		ipcRenderer.send("request-google-photos-auth")
	}

	@autobind
	handleDisconnect() {
		ipcRenderer.send("disconnect-google-photos-auth")
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
		const { initialized, connected, images, fetching } = this.state

		if (!initialized) {
			return (
				<div className="google-photos-wrap">
					<div className="google-photos-cover">
						<Loading />
					</div>
				</div>
			)
		}

		if (!connected) {
			return (
				<div className="google-photos-wrap">
					<div className="google-photos-cover">
						<RaisedButton label="Google Photos 연결" primary={true} onClick={this.handleRequestAuth} />
					</div>
				</div>	
			)
		}

		return (
			<PhotoList images={images} fetching={fetching}
				onFetch={this.handleRequestFetch}
				onClick={this.handleImageSelect}
				onDisconnect={this.handleDisconnect} />
		)
	}
}

export default GooglePhotosApp
