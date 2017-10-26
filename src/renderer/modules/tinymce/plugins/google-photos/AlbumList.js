import React, { Component } from 'react'
import { GridList, GridTile } from 'material-ui/GridList'
import Subheader from 'material-ui/Subheader'
import RaisedButton from 'material-ui/RaisedButton'

class AlbumList extends Component {
	render() {
		const { albums, onClick, onDisconnect } = this.props

		return (
			<div className="google-photos-wrap">
				<div className="photos-header">
					<span className="album-title">{albums.length} Albums</span>
					<RaisedButton label="연결해제" onClick={onDisconnect} />
				</div>
				<div className="photos-list">
					<GridList cols={3}>
						{Array.prototype.map.call(albums, item =>
							<GridTile key={item['id'][0]} title={item['title'][0]} subtitle={item['summary'][0]} onClick={e => onClick(item)}>
								<img src={item['media:group'][0]['media:thumbnail'][0]['$']['url']} />
							</GridTile>
						)}
					</GridList>
				</div>
			</div>
		)
	}
}

export default AlbumList
