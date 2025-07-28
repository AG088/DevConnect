import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  language: string;
  isGithub: boolean;
  repoUrl?: string;
  // GitHub-specific fields
  githubRepoId?: number;
  githubStars?: number;
  githubForks?: number;
  githubLastSynced?: Date;
  technologies: string[];
  visibility: 'public' | 'private';
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IProjectModel extends Model<IProject> {
  // Add any static methods here if needed
}

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    maxLength: [100, 'Project name cannot be more than 100 characters'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description'],
    maxLength: [1000, 'Description cannot be more than 1000 characters'],
    trim: true,
  },
  language: {
    type: String,
    required: [true, 'Please specify the main programming language'],
    trim: true,
  },
  isGithub: {
    type: Boolean,
    required: [true, 'Please specify if this is a GitHub project'],
    default: false,
  },
  repoUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (this.isGithub) {
          return /^https:\/\/github\.com\/.+\/.+$/.test(v);
        }
        return true;
      },
      message: 'Please provide a valid GitHub repository URL'
    }
  },
  // GitHub-specific fields
  githubRepoId: {
    type: Number,
  },
  githubStars: {
    type: Number,
    default: 0,
  },
  githubForks: {
    type: Number,
    default: 0,
  },
  githubLastSynced: {
    type: Date,
  },
  technologies: [{
    type: String,
    trim: true,
  }],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
projectSchema.pre('save', function(this: IProject, next: mongoose.CallbackWithoutResultAndOptionalError) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
const Project = mongoose.models.Project || mongoose.model<IProject, IProjectModel>('Project', projectSchema);

export default Project; 