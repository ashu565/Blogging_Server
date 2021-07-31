const Blog = require("../model/blogModel");
const APIFeatures = require("../utils/ApiFeatures");
const cloudinary = require("../utils/cloudinary");
exports.createBlog = async (req, res, next) => {
  try {
    const { author, title, description, tags, body } = req.body;
    const document = await Blog.create({
      author,
      title,
      description,
      tags,
      body,
    });
    res.status(201).json({
      status: "success",
      data: {
        document,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.getAllBlog = async (req, res, next) => {
  try {
    const features = new APIFeatures(Blog.find(), req.query).filter().sort();
    const document = await features.query;
    res.status(201).json({
      document,
    });
  } catch (err) {
    next(err);
  }
};
exports.getBlog = async (req, res, next) => {
  try {
    const document = await Blog.findOne({
      _id: req.params.blogId,
    }).populate("comments");
    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllTags = async (req, res, next) => {
  try {
    const data = await Blog.find();
    const tag_values = new Map();
    data.forEach((blog) => {
      blog.tags.forEach((tag) => {
        if (tag_values.get(tag) === undefined) {
          tag_values.set(tag, 1);
        } else {
          const temp = tag_values.get(tag);
          tag_values.set(tag, temp + 1);
        }
      });
    });
    const tag_values_object = Object.fromEntries(tag_values);
    res.status(201).json({
      tag_values_object,
    });
  } catch (err) {
    next(err);
  }
};

exports.searchedBlog = async (req, res, next) => {
  try {
    const searched_word = req.query.word;
    const document = await Blog.find({
      $text: {
        $search: searched_word,
        $caseSensitive: false,
      },
    });
    res.status(201).json({
      document,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTaggedBlogs = async (req, res, next) => {
  try {
    const { tags } = req.body; // tags is an array
    const document = await Blog.find({
      tags: { $all: tags },
    });
    res.status(201).json({
      document,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllBlogFromUser = async (req, res, next) => {
  try {
    const documents = await Blog.find();
    const filtered_documents = documents.map((document) => {
      if (document.author.id === req.params.id) {
        return document;
      }
    });
    console.log(filtered_documents);
    res.status(200).json({
      status: "success",
      data: {
        filtered_documents,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.updateBlog = async (req, res, next) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: false,
    });
    res.status(200).json({
      status: "success",
      data: {
        updatedBlog,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.status(201).json({
      url: result.secure_url,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(201).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
exports.updateLikes = async (req, res, next) => {
  try {
    const { userId, blogId } = req.body;
    let blog = await Blog.findById(blogId);
    const index = blog.Likes.indexOf(userId);
    if (index === -1) {
      blog.Likes.push(userId);
    }
    blog.likes = blog.Likes.length;
    await blog.save({
      runValidators: false,
      new: true,
    });
    res.status(201).json({
      status: "success",
      likes: blog.likes,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteLikes = async (req, res, next) => {
  try {
    const { userId, blogId } = req.body;
    let blog = await Blog.findById(blogId);
    const filtered_blog = blog.Likes.filter((value) => {
      return value !== userId;
    });
    blog.Likes = filtered_blog;
    blog.likes = blog.Likes.length;
    await blog.save({
      runValidators: false,
      new: true,
    });
    res.status(200).json({
      status: "success",
      likes: blog.likes,
    });
  } catch (err) {
    next(err);
  }
};
