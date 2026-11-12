const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      required: true,
      enum: [
        'Super Admin',
        'MD / Director',
        'Sales Manager',
        'Sales Executive',
        'Estimation Engineer',
        'Engineering Manager',
        'Accounts Manager',
        'Accounts Executive',
        'Production Manager',
        'Purchase Manager'
      ],
      default: 'Sales Executive'
    },
    department: {
      type: String,
      enum: ['Sales & Marketing', 'Engineering & Estimation', 'Finance & Accounts', 'Production & Manufacturing', 'Purchase & Supply Chain', 'Executive Management', 'Administration'],
      default: 'Sales & Marketing'
    },
    phone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
