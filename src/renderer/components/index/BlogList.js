import React from 'react'
import List from '@material-ui/core/List'
import BlogListItem from './BlogListItem'


export default function BlogList({blogs, onSelect}) {
  return (
    <div className="blog_list">
      <List>
        {blogs.sort((a,b) =>
          a.primary? -1 : b.primary? 1 : 0
        ).map(blog =>
          <BlogListItem key={blog.url} blog={blog} onSelect={onSelect} />
        )}
      </List>
    </div>
  );
}
