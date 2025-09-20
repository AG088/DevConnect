import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageContent?: string;
  lastMessageTime?: Date;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

interface IConversationModel extends Model<IConversation> {
  getConversation(user1Id: string, user2Id: string): Promise<IConversation | null>;
  getUserConversations(userId: string): Promise<IConversation[]>;
  updateLastMessage(conversationId: string, messageId: string, content: string, senderId: string): Promise<void>;
  incrementUnreadCount(conversationId: string, recipientId: string): Promise<void>;
  resetUnreadCount(conversationId: string, userId: string): Promise<void>;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
  lastMessageContent: {
    type: String,
    maxLength: 100,
  },
  lastMessageTime: {
    type: Date,
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
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

conversationSchema.pre('save', function(next) {
  this.participants = [...new Set(this.participants)].sort();
  this.updatedAt = new Date();
  next();
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'unreadCount': 1 });

conversationSchema.statics.getConversation = async function(user1Id: string, user2Id: string) {
  const participants = [user1Id, user2Id].sort();
  return this.findOne({ participants: { $all: participants, $size: 2 } })
    .populate('participants', 'name image githubUsername')
    .populate('lastMessage');
};

conversationSchema.statics.getUserConversations = async function(userId: string) {
  return this.find({ participants: userId })
    .populate('participants', 'name image githubUsername')
    .populate('lastMessage')
    .sort({ lastMessageTime: -1, updatedAt: -1 });
};

conversationSchema.statics.updateLastMessage = async function(
  conversationId: string,
  messageId: string,
  content: string,
  senderId: string
) {
  await this.findByIdAndUpdate(conversationId, {
    lastMessage: messageId,
    lastMessageContent: content,
    lastMessageTime: new Date(),
    $inc: { [`unreadCount.${senderId}`]: 0 } // Ensure the field exists
  });
};

conversationSchema.statics.incrementUnreadCount = async function(conversationId: string, recipientId: string) {
  await this.findByIdAndUpdate(conversationId, {
    $inc: { [`unreadCount.${recipientId}`]: 1 }
  });
};

conversationSchema.statics.resetUnreadCount = async function(conversationId: string, userId: string) {
  await this.findByIdAndUpdate(conversationId, {
    $set: { [`unreadCount.${userId}`]: 0 }
  });
};

const Conversation = mongoose.models.Conversation || mongoose.model<IConversation, IConversationModel>('Conversation', conversationSchema);

export default Conversation; 