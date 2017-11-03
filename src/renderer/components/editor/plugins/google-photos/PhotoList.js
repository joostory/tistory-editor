import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import IconButton from 'material-ui/IconButton'
import NavigationBack from 'material-ui/svg-icons/navigation/arrow-back'
import { GridList, GridTile } from 'material-ui/GridList'
import Subheader from 'material-ui/Subheader'
import update from 'immutability-helper'

import Loading from '../../../../components/Loading'

class PhotoList extends Component {
	
	constructor(props, context) {
		super(props, context)
		this.state = {
			images: [],
			fetching: false
		}
	}

	componentDidMount() {
		const { album, onBack } = this.props
		const { list } = this.refs
		ipcRenderer.on("receive-google-photos-images", this.handleReceiveImages)
		list.addEventListener('scroll', this.handleScrollList)
		this.requestFetch(1)
	}

	componentWillUnmount() {
		const { list } = this.refs

		ipcRenderer.removeListener("receive-google-photos-images", this.handleReceiveImages)

		list.removeEventListener('scroll', this.handleScrollList)
	}

	requestFetch(startIndex) {
		const { album } = this.props

		ipcRenderer.send('fetch-google-photos-images', album['gphoto:id'][0], startIndex)
		this.setState({
			fetching: true
		})
	}

	@autobind
	handleReceiveImages(e, data) {
		const { onDisconnect } = this.props
		const { images, fetching } = this.state
		// TODO
		if (data === null) {
			onDisconnect()
			return
		}

		this.setState({
			images: update(images, {
				$push: data
			}),
			fetching: false
		})
	}

	@autobind
	handleScrollList(e) {
		const { clientHeight, scrollHeight, scrollTop } = e.target
		const { images, fetching } = this.state

		if (fetching) {
			return
		}
		
		if (clientHeight + scrollTop + 200 > scrollHeight) {
			this.requestFetch(images.length + 1)
		}
	}

	render() {
		const { album, onBack, onClick } = this.props
		const { images, fetching } = this.state

		return (
			<div className="google-photos-wrap">
				<div className="photos-header">
					<IconButton onClick={onBack}><NavigationBack /></IconButton>
					<span className="album-title">{album['title'][0]}</span>
				</div>
				<div ref="list" className="photos-list">
					{images.length === 0 && fetching &&
						<div className="google-photos-cover">
							<Loading />
						</div>
					}
					{images &&
						<GridList cols={3}>
							{Array.prototype.filter.call(images, item => (!item['gphoto:videostatus'])).map(item => (
								<GridTile key={item['id'][0]} title={item['title'][0]} subtitle={item['summary'][0]} onClick={e => onClick(item)}>
									<img src={item['content'][0]['$']['src']} />
								</GridTile>
							))}
						</GridList>
					}
					{images.length > 0 && fetching &&
						<div className="google-photos-footer">
							<Loading />
						</div>
					}
				</div>
			</div>
		)
	}
}

export default PhotoList
