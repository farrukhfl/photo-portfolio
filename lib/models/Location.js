import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

locationSchema.index({ name: 1, city: 1 }, { unique: true });

export default mongoose.models.Location || mongoose.model('Location', locationSchema);
