import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'

import {
  GridList,
  GridListTile,
  GridListTileBar,
  ListSubheader,
  IconButton
} from '@material-ui/core'

import { Info } from '@material-ui/icons'

import Loading from '../../../../components/Loading'
import { timestampsToDate } from '../../../../modules/ContentHelper'

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
            <GridList>
              {images.map(item => {
                let prevDate = currentDate
                currentDate = timestampsToDate(item.timestamp)
                return (
                  <Fragment key={item.id}>
                    { prevDate != currentDate &&
                      <GridListTile>
                        <ListSubheader>{currentDate}</ListSubheader>
                      </GridListTile>
                    }

                    <GridListTile key={item.thumbnail}>
                      <img src={item.thumbnail} alt={item.title} />
                      <GridListTileBar
                        title={item.title}
                        actionIcon={
                          <IconButton onClick={e => onClick(item)}>
                            <Info />
                          </IconButton>
                        }
                      />
                    </GridListTile>
                  </Fragment>
                )  
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
