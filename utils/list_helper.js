const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.length === 0 ?
    0 :
    blogs.reduce((sum, next) => sum + next.likes, 0);
};

const favoriteBlog = (blogs) => {
  let max = blogs[0];
  blogs.forEach((blog) => {
    if(blog.likes > max.likes) {
      max = blog;
    }
  });
  return blogs.length === 0 ? {}
    : {
      title: max.title,
      author: max.author,
      likes: max.likes
    };
};


const mostBlogs = (blogs) => {
  const authors = {};
  blogs.forEach(blog => {
    if(authors[blog.author]) {
      authors[blog.author]++;
    } else {
      authors[blog.author] = 1;
    }
  });

  let max = blogs[0]?.author;

  for(let author in authors) {
    if(authors[max] < authors[author]) {
      max = author;
    }
  }

  return blogs.length === 0 ? {} : { author: max, blogs: authors[max] };

};


const mostLikes = (blogs) => {
  const authors = {};
  blogs.forEach(blog => {
    if(authors[blog.author]) {
      authors[blog.author]+=blog.likes;
    } else {
      authors[blog.author] = blog.likes;
    }
  });

  let max = blogs[0]?.author;

  for(let author in authors) {
    if(authors[max] < authors[author]) {
      max = author;
    }
  }

  return blogs.length === 0 ? {} : { author: max, likes: authors[max] };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};