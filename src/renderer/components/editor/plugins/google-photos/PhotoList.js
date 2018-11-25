import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'

import { Button, IconButton, GridList, GridListTile, GridListTileBar, ListSubheader } from '@material-ui/core'
import { PlusOne } from '@material-ui/icons'

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
    let currentDate = ''

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

          {images.length > 0 &&
            <div className='photos-item-wrap'>
              {images.filter(item => !item.isVideo).map(item => {
                let prevDate = currentDate
                currentDate = timstampToDate(item.timestamp)
                return (
                  <Fragment key={item.id}>
                    { prevDate != currentDate &&
                      <div className='photos-sub-header'>
                        {currentDate}
                      </div>
                    }
                    <div className='photos-item'>
                      <div className='photos-item-image-wrap'>
                        <img className='photos-item-image' src={item.url} alt={item.title} onClick={e => onClick(item)} />
                      </div>
                    </div>
                  </Fragment>
                )  
              })}
            </div>
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
