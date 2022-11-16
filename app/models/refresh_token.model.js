module.exports = mongoose => {
    const { Schema } = mongoose;
    const RefreshToken = mongoose.model(
        "refresh_tokens",
        mongoose.Schema(
            {
                user_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
                refresh_token:{
                    type: String,
                },
            },
            { timestamps: true }
        )
    );

    return RefreshToken;
};