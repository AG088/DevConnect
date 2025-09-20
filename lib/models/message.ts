import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'code' | 'file' | 'image';
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IMessageModel extends Model<IMessage> {
  getConversation(user1Id: string, user2Id: string, limit?: number, skip?: number): Promise<IMessage[]>;
  markAsRead(messageId: string): Promise<void>;
  markConversationAsRead(user1Id: string, user2Id: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

const messageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxLength: [2000, 'Message cannot be more than 2000 characters'],
  },
  messageType: {
    type: String,
    enum: ['text', 'code', 'file', 'image'],
    default: 'text',
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
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

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1 });
messageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

messageSchema.statics.getConversation = async function(
  user1Id: string,
  user2Id: string,
  limit = 50,
  skip = 0
) {
  return this.find({
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id }
    ]
  })
    .populate('sender', 'name image githubUsername')
    .populate('recipient', 'name image githubUsername')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

messageSchema.statics.markAsRead = async function(messageId: string) {
  await this.findByIdAndUpdate(messageId, {
    read: true,
    readAt: new Date()
  });
};

messageSchema.statics.markConversationAsRead = async function(user1Id: string, user2Id: string) {
  await this.updateMany(
    {
      sender: user2Id,
      recipient: user1Id,
      read: false
    },
    {
      read: true,
      readAt: new Date()
    }
  );
};

messageSchema.statics.getUnreadCount = async function(userId: string) {
  const result = await this.aggregate([
    {
      $match: {
        recipient: new mongoose.Types.ObjectId(userId),
        read: false
      }
    },
    {
      $group: {
        _id: '$sender',
        count: { $sum: 1 }
      }
    }
  ]);
  return result.reduce((total, item) => total + item.count, 0);
};

const Message = mongoose.models.Message || mongoose.model<IMessage, IMessageModel>('Message', messageSchema);

export default Message; 