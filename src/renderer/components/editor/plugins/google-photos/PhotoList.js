import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'

import {
  GridList,
  GridListTile,
  GridListTileBar,
  ListSubheader,
  IconButton
} from '@mui/material'

import { AddCircleOutline } from '@mui/icons-material'

import Loading from '../../../../components/Loading'
import { timestampsToDate } from '../../../../modules/ContentHelper'

const styles = {
  buttonIcon: {
    color: 'rgba(255, 255, 255, 0.54)'
  },
  gridTitleBar: {
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
  }
}

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
			onFetch()
		}
	}

	render() {
		const { onClick, images, fetching } = this.props

    let lastDate = ''
    let currentDate = ''

		return (
			<div className="google-photos-wrap">
				<div ref="list" className="photos-list">
					{images.length === 0 && fetching &&
						<div className="google-photos-cover">
							<Loading position='relative' />
						</div>
          }

          {images.length > 0 &&
            <GridList cols={2} cellHeight={180}>
              {images.map(item => {
                let prevDate = currentDate
                currentDate = timestampsToDate(item.timestamp)

                let tile = [
                  <GridListTile key={item.thumbnail}>
                    <img src={item.thumbnail} alt={item.title} />
                    <GridListTileBar
                      style={styles.gridTitleBar}
                      actionIcon={
                        <IconButton onClick={e => onClick(item)}>
                          <AddCircleOutline style={styles.buttonIcon} />
                        </IconButton>
                      }
                    />
                  </GridListTile>
                ]

                if (prevDate != currentDate) {
                  tile.unshift(
                    <GridListTile key={currentDate} cols={2} style={{ height: 'auto' }}>
                      <ListSubheader component='div'>{currentDate}</ListSubheader>
                    </GridListTile>
                  )
                }

                return tile
              })}
            </GridList>
          }

					{images.length > 0 && fetching &&
						<div className="google-photos-footer">
							<Loading position='relative' />
						</div>
					}
				</div>
			</div>
		)
	}
}

export default PhotoList
