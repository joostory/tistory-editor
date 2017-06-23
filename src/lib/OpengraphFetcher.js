import ogp from 'open-graph-scraper'

class OpengraphFetcher {
	static fetch(url, callback) {

		let options = {
			url: url
		}
		ogp({
			url: url
		}, (err, results) => {
			const { ogUrl, ogTitle, ogDescription, ogType, ogImage, ogVideo } = results.data
			let opengraph = {
				url: ogUrl,
				title: ogTitle,
				description: ogDescription,
				type: ogType,
				host: (new URL(ogUrl)).host
			}

			if (ogImage) {
				opengraph.image = ogImage.url
			}

			if (ogVideo) {
				opengraph.mediaUrl = ogVideo.url
			}

			callback(opengraph)
		})
	}
}

export default OpengraphFetcher
