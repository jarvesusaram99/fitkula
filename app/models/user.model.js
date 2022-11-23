module.exports = (mongoose) => {
  const User = mongoose.model(
    "users",
    mongoose.Schema(
      {
        uid: { 
          type: String, 
          default: null 
        },
        fullname: { 
          type: String, 
          default: null
        },
        device_id: {
          type: String,
          default: null
        },
        firebase_token: {
          type: String,
          default: null
        },
        is_profile_com: {type: Boolean, default: false},
        email: { type: String, default: null },
        password: { type: String, default: null },
        username: { type: String, default: null },
        mobile: { type: String, default: null },
        country_code: { type: String },
        image: { type: String, default: null },
        post_count: { type: Number, default: 0 },
        followers_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },
        login_type: { type: String, enum: ["M", "G", "F", "Li"], default: "M"},
        device_type: { type: String, enum: ["A", "I", "W"], default: "A" },
        device_token: { type: String, default: null },
        status: { type: Number, enum: [0, 1], default: 1 },
        is_verified: { type: Number, enum: [0, 1], default: 0 },
        date_of_birth: { type: Date, default: null },
      },
      { timestamps: true }
    )
  );

  return User;
};
