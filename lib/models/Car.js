import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

carSchema.index({ make: 1, model: 1 }, { unique: true });

export default mongoose.models.Car || mongoose.model('Car', carSchema);
