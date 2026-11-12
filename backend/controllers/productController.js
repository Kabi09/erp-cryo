const Product = require('../models/Product');
const { getProductCode } = require('../utils/generateDocNumber');
const logAudit = require('../utils/auditLogger');

// @desc Get all products
// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { modelNumber: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const products = await Product.find(query).sort({ productName: 1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get product by ID
// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Product
// @route POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const productId = await getProductCode();

    const product = await Product.create({
      ...req.body,
      productId
    });

    await logAudit(req, 'CREATE', 'Product', product._id.toString(), { productName: product.productName, model: product.modelNumber });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update Product
// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await logAudit(req, 'UPDATE', 'Product', product._id.toString(), { productName: product.productName });

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete Product
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.status = 'Discontinued';
    await product.save();

    await logAudit(req, 'DELETE', 'Product', product._id.toString(), { productName: product.productName });

    res.json({ success: true, message: 'Product discontinued successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
