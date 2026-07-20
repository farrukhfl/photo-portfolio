import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    altText: {
      type: String,
      required: [true, 'Alt text is required on every image/video'],
      trim: true,
      minlength: [3, 'Alt text must be at least 3 characters'],
    },
    type: { type: String, enum: ['image', 'video'], required: true },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    body: { type: String, default: '' }, // markdown

    media: {
      type: [mediaSchema],
      validate: {
        validator(v) {
          // Drafts may be media-less while being assembled; published posts must have media.
          return this.status !== 'published' || (Array.isArray(v) && v.length > 0);
        },
        message: 'A published post needs at least one image or video',
      },
    },

    carMake: { type: String, trim: true, default: '' },
    carModel: { type: String, trim: true, default: '' },
    carYear: { type: Number, min: 1900, max: 2100 },

    location: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },

    tags: { type: [String], default: [] },
    seoKeywords: { type: [String], default: [] },
    metaTitle: { type: String, trim: true, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 320, default: '' },

    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: null },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ status: 1, featured: 1, publishedAt: -1 });
postSchema.index({ carMake: 1 });
postSchema.index({ city: 1 });
postSchema.index({ tags: 1 });

// Stamp publishedAt the first time a post goes live.
postSchema.pre('save', function (next) {
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
  next();
});

export default mongoose.models.Post || mongoose.model('Post', postSchema);
