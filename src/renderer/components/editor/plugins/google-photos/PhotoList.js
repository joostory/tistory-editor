import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'

import { Button, Grid } from '@material-ui/core'

import Loading from '../../../../components/Loading'
import { timstampToDate } from '../../../../modules/ContentHelper'

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

		let lastDate = ''

		return (
			<div className="google-photos-wrap">
				<div className="photos-header">
					<Button variant='contained' onClick={onDisconnect}>연결해제</Button>
				</div>
				<div ref="list" className="photos-list">
					{images.length === 0 && fetching &&
						<div className="google-photos-cover">
							<Loading />
						</div>
					}
					{images.length > 0 && images.filter(item => !item.isVideo).map(item => {
            return (
              <Grid key={item.id} xs={12} sm={3} item={true} title={timstampToDate(item.timestamp)} subtitle={item.summary} onClick={e => onClick(item)}>
                <img src={item.url} />
              </Grid>
            )
          })}
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
