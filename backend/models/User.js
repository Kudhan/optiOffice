const mongoose = require('mongoose');

// Mongoose schema designed to precisely match the structure used by the Python codebase in MongoDB
const userSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    default: 'default_tenant'
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ""
  },
  profile_photo: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  publicProfile: {
    preferredName: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    avatarUrl: { type: String, default: "" },
    workEmail: { type: String, default: "" }
  },
  privateIdentity: {
    legalName: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    nationality: { type: String, default: "" },
    personalContact: {
      email: { type: String, default: "" },
      mobile: { type: String, default: "" }
    },
    address: { type: String, default: "" },
    emergencyContact: {
      name: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phone: { type: String, default: "" }
    },
    taxId: { type: String, default: "" },
    passportNumber: { type: String, default: "" },
    resumeUrl: { type: String, default: "" }
  },
  secureVault: {
    bankDetails: {
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountHolder: { type: String, default: "" }
    }
  },
  leave_balance: {
    type: Number,
    default: 20
  },
  disabled: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    required: true
  },
  hashed_password: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    default: ""
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department: {
    type: String,
    default: "General"
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'suspended', 'Active', 'frozen'],
    default: 'active',
    set: v => v.toLowerCase()
  },
  joining_date: {
    type: String,
    default: ""
  },
  sessionVersion: {
    type: Number,
    default: 0
  },
  preferences: {
    language: { type: String, default: "en" },
    timezone: { type: String, default: "UTC" },
    notifications: { type: String, default: "email" }
  },
  shift_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    default: null
  }

}, {
  collection: 'users_collection',
  timestamps: true
});

// Encryption logic for secureVault
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY || 'v-super-secret-key-32-chars-long!!'; // Must be 32 chars
const IV_LENGTH = 16;

userSchema.pre('save', function(next) {
  if (this.isModified('secureVault')) {
    const encrypt = (text) => {
      if (!text) return text;
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
    };

    if (this.secureVault.bankDetails) {
      if (this.secureVault.bankDetails.accountNumber) 
        this.secureVault.bankDetails.accountNumber = encrypt(this.secureVault.bankDetails.accountNumber);
      if (this.secureVault.bankDetails.ifscCode) 
        this.secureVault.bankDetails.ifscCode = encrypt(this.secureVault.bankDetails.ifscCode);
    }
  }
  next();
});

// Helper to decrypt Vault data
userSchema.methods.decryptVault = function() {
  const decrypt = (text) => {
    if (!text || !text.includes(':')) return text;
    try {
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (e) {
      return text;
    }
  };

  if (this.secureVault && this.secureVault.bankDetails) {
    if (this.secureVault.bankDetails.accountNumber)
      this.secureVault.bankDetails.accountNumber = decrypt(this.secureVault.bankDetails.accountNumber);
    if (this.secureVault.bankDetails.ifscCode)
      this.secureVault.bankDetails.ifscCode = decrypt(this.secureVault.bankDetails.ifscCode);
  }
};

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

userSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('User', userSchema);
