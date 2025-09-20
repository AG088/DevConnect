import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

interface IPostModel extends Model<IPost> {
  getPostsWithAuthors(limit?: number, skip?: number): Promise<IPost[]>;
  getUserPosts(userId: string, limit?: number, skip?: number): Promise<IPost[]>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
}

const postSchema = new Schema<IPost>({
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxLength: [1000, 'Post content cannot be more than 1000 characters'],
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

postSchema.statics.getPostsWithAuthors = async function(limit = 50, skip = 0) {
  return this.find()
    .populate('authorId', 'name image title githubAvatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

postSchema.statics.getUserPosts = async function(userId: string, limit = 50, skip = 0) {
  return this.find({ authorId: userId })
    .populate('authorId', 'name image title githubAvatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

postSchema.statics.likePost = async function(postId: string, userId: string) {
  await this.findByIdAndUpdate(postId, {
    $addToSet: { likes: userId }
  });
};

postSchema.statics.unlikePost = async function(postId: string, userId: string) {
  await this.findByIdAndUpdate(postId, {
    $pull: { likes: userId }
  });
};

const Post = mongoose.models.Post || mongoose.model<IPost, IPostModel>('Post', postSchema);

export default Post; 