import fetch from 'isomorphic-fetch'
import cheerio from 'cheerio'
import { URL } from 'url'

const makeTitle = ($) => {
	let ogTitle = $('head meta[property="og:title"]').attr('content')
	let htmlTitle = $('head title').text()
	if (ogTitle) {
		return ogTitle
	} else if (htmlTitle) {
		return htmlTitle
	} else {
		return ''
	}
}

const makeDescription = ($) => {
	let ogDescription = $('head meta[property="og:description"]').attr('content')
	let htmlDescription = $('head meta[name="description"]').attr('content')
	if (ogDescription) {
		return ogDescription
	} else if (htmlDescription) {
		return htmlDescription
	} else {
		return ''
	}
}

const makeUrl = ($, url) => {
	const og = $('head meta[property="og:url"]').attr('content')
	let result = og? og : url
	return result.replace(/^\/\//, 'http://')
}

const makeImage = ($) => {
	const og = $('head meta[property="og:image"]').attr('content')
	let result = og? og : ''
	return result.replace(/^\/\//, 'http://')
}

const makeType = ($, url) => {
	let og = $('head meta[property="og:type"]').attr('content')
	if (og) {
		return og
	} else {
		return 'website'
	}
}

const makeMediaUrl = ($, url) => {
	let og = $('head meta[property="og:video:url"]').attr('content')
	if (og) {
		return og
	} else {
		return ''
	}
}


class OpengraphFetcher {
	static fetch(url, callback) {

		fetch(url)
			.then(res => res.text())
			.then(text => {
				let $ = cheerio.load(text)

				let opengraph = {
					title: makeTitle($),
					description: makeDescription($),
					url: makeUrl($, url),
					image: makeImage($),
					type: makeType($),
					mediaUrl: makeMediaUrl($)
				}
				opengraph.host = new URL(opengraph.url).hostname
				callback(opengraph)
			})
	}
}

export default OpengraphFetcher
