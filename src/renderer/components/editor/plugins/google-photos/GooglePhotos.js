import React, { useEffect, useState } from 'react'
import { ipcRenderer } from 'electron'
import update from 'immutability-helper'
import { Button } from '@material-ui/core'
import Loading from '../../../Loading'
import PhotoList from './PhotoList'


export default function GooglePhotos({ connected, onConnect, onDisconnect, onSelectImage }) {
  const [initialized, setInitialized] = useState(false)
  const [images, setImages] = useState([])
  const [fetching, setFetching] = useState(false)
  const [nextPageToken, setNextPageToken] = useState(null)

  function handleReceiveImages(e, data) {
		if (data === null) {
      onDisconnect()
			return
		}

    console.log("connected", data)

    setInitialized(true)
    setImages(update(images, {
      $push: data.images
    }))
    setNextPageToken(data.nextPageToken)
    setFetching(false)
    onConnect(true)
	}

  function handleStartFetch(e) {
    setFetching(true)
	}

  function handleReceiveConnected(e, connected) {
    setInitialized(true)

		if (connected) {
      onConnect()
		} else {
      setImages([])
      setNextPageToken(null)
      onDisconnect()
    }
	}

  function handleRequestFetch() {
		ipcRenderer.send('fetch-google-photos-images', nextPageToken)
	}

  function handleRequestAuth() {
		ipcRenderer.send("request-google-photos-auth")
	}

  function handleImageSelect(image) {
		if (confirm('이미지를 삽입하시겠습니까?')) {
			onSelectImage(image.url, image.title)
		}
	}

  useEffect(() => {
    handleRequestFetch()
    ipcRenderer.on("receive-google-photos-images", handleReceiveImages)
		ipcRenderer.on("start-fetch-google-photos-images", handleStartFetch)
		ipcRenderer.on("receive-google-connected", handleReceiveConnected)

    return () => {
      ipcRenderer.removeListener("receive-google-photos-images", handleReceiveImages)
      ipcRenderer.removeListener("start-fetch-google-photos-images", handleStartFetch)
      ipcRenderer.removeListener("receive-google-connected", handleReceiveConnected)
    }
  }, [])


  if (!initialized) {
    return (
      <div className="google-photos-wrap">
        <div className="google-photos-cover">
          <Loading position='absolute' />
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="google-photos-wrap">
        <div className="google-photos-cover">
          <Button variant='contained' className='btn btn_tistory' onClick={handleRequestAuth}>
            Google Photos 연결
          </Button>
        </div>
      </div>	
    )
  }

  return (
    <PhotoList images={images} fetching={fetching}
      onFetch={handleRequestFetch}
      onClick={handleImageSelect} />
  )
}
