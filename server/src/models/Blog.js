const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'Market Insights' },
    author: { type: String, default: 'RealEstate Editorial Team' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200' },
    readTime: { type: String, default: '4 min read' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
