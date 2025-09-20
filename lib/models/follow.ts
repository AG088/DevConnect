import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId; // User who wants to follow
  following: mongoose.Types.ObjectId; // User being followed
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface IFollowModel extends Model<IFollow> {
  getFollowers(userId: string): Promise<IFollow[]>;
  getFollowing(userId: string): Promise<IFollow[]>;
  getPendingRequests(userId: string): Promise<IFollow[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
}

const followSchema = new Schema<IFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

followSchema.statics.getFollowers = async function(userId: string) {
  return this.find({ following: userId, status: 'accepted' })
    .populate('follower', 'name email image title githubUsername')
    .sort({ createdAt: -1 });
};

followSchema.statics.getFollowing = async function(userId: string) {
  return this.find({ follower: userId, status: 'accepted' })
    .populate('following', 'name email image title githubUsername')
    .sort({ createdAt: -1 });
};

followSchema.statics.getPendingRequests = async function(userId: string) {
  return this.find({ following: userId, status: 'pending' })
    .populate('follower', 'name email image title githubUsername')
    .sort({ createdAt: -1 });
};

followSchema.statics.isFollowing = async function(followerId: string, followingId: string) {
  const follow = await this.findOne({
    follower: followerId,
    following: followingId,
    status: 'accepted'
  });
  return !!follow;
};

const Follow = mongoose.models.Follow || mongoose.model<IFollow, IFollowModel>('Follow', followSchema);

export default Follow; 