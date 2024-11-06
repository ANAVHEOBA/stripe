import mongoose, { Schema, Document } from 'mongoose';
import { Property, PlanType } from '../types/property.types';

export interface IPropertyDocument extends Omit<Property, 'id'>, Document {}

const PropertySchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  planType: {
    type: String,
    enum: Object.values(PlanType),
    required: true
  },
  planStartDate: {
    type: Date,
    required: true
  },
  planEndDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add any pre-save hooks or methods here if needed
PropertySchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

// Export the model
const Property = mongoose.model<IPropertyDocument>('Property', PropertySchema);
export { Property };