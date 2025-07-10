import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional for Google OAuth users
  image?: string; // For profile picture from Google
  title?: string; // For user's job title/role
  createdAt: Date;
  updatedAt: Date;
  comparePassword?(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  // Add any static methods here if needed
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxLength: [50, 'Name cannot be more than 50 characters'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function(this: IUser) {
      // Password is only required for credential-based users
      // Google OAuth users don't need a password
      return !this.image; // If no image (Google profile), password is not required
    },
    minLength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  image: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    default: "Developer",
    trim: true,
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

// Update the updatedAt field before saving
userSchema.pre('save', function(this: IUser, next: mongoose.CallbackWithoutResultAndOptionalError) {
  this.updatedAt = new Date();
  next();
});

// Add method to compare passwords (only for credential users)
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false; // Google OAuth users don't have passwords
  }
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const User = mongoose.models.User || mongoose.model<IUser, IUserModel>('User', userSchema);

export default User; 