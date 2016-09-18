
class Database {

	constructor() {
		this.getDB(db => { })
	}

	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database()
		}
		return Database.instance
	}

	getDB(action) {
		if (this.db) {
			action(this.db)
		} else {
			var request = indexedDB.open("LocalPosts")
			request.onerror = (e) => { console.log("ERROR!", e) }
			request.onsuccess = (e) => {
				this.db = request.result
				action(this.db)
			}
			request.onupgradeneeded = (e) => {
				var db = e.target.result
				var objectStore = db.createObjectStore("posts", { keyPath: "id" })
				objectStore.createIndex("date", "date", { unique: false })
			}
		}
	}

	getPosts(callback) {
		this.getDB(db => {
			db.transaction(["posts"])
						.objectStore("posts")
						.getAll().onsuccess = (e) => {
				callback(e.target.result)
			}
		})
	}

	newPost(id, callback) {
		var post = {
			id: id,
			title: "NEW POST",
			date: new Date(),
			content: "# NEW POST"
		}

		this.getDB(db => {
			var transaction = db.transaction(["posts"], "readwrite")
			transaction.onerror = (e) => {
				console.log("ERROR!", e)
			}
			transaction.objectStore("posts")
						.add(post).onsuccess = (e) => {
				callback(post)
			}
		})
	}

	updatePost(post, callback) {
		this.getDB(db => {
			db.transaction(["posts"], "readwrite")
						.objectStore("posts")
						.put(post).onsuccess = (e) => {
				callback(e.target.result)
			}
		})
	}

	removePost(id, callback) {
		this.getDB(db => {
			db.transaction(["posts"], "readwrite")
						.objectStore("posts")
						.delete(id).onsuccess = (e) => {
				callback()
			}
		})
	}

}

export default Database
