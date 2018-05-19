import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import NavigationBack from 'material-ui/svg-icons/navigation/arrow-back'
import { GridList, GridTile } from 'material-ui/GridList'
import Subheader from 'material-ui/Subheader'
import update from 'immutability-helper'

import Loading from '../../../../components/Loading'

class PhotoList extends Component {
	
	componentDidMount() {
		const { album, onBack } = this.props
		const { list } = this.refs
		list.addEventListener('scroll', this.handleScrollList)
	}

	componentWillUnmount() {
		const { list } = this.refs
		list.removeEventListener('scroll', this.handleScrollList)
	}

	@autobind
	handleScrollList(e) {
		const { onFetch, images, fetching } = this.props
		const { clientHeight, scrollHeight, scrollTop } = e.target

		if (fetching) {
			return
		}
		
		if (clientHeight + scrollTop + 200 > scrollHeight) {
			onFetch(images.length + 1)
		}
	}

	render() {
		const { onClick, onDisconnect, images, fetching } = this.props

		return (
			<div className="google-photos-wrap">
				<div className="photos-header">
					<RaisedButton label="연결해제" onClick={onDisconnect} />
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
