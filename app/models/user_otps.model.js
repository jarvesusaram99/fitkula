module.exports = mongoose => {
  const { Schema } = mongoose;
  const UserOtp = mongoose.model(
    "user_otp",
    mongoose.Schema(
      {
        otp: {
          type: String
        },
        user_id: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      },
      { timestamps: true }
    )
  );

  return UserOtp;
};