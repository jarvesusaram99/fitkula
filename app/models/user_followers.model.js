module.exports = mongoose => {
    const { Schema } = mongoose;
    const UserFollowers = mongoose.model(
        "user_followers",
        mongoose.Schema(

            {
                user_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
                following_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
            },
            { timestamps: true }
        )
    );

    return UserFollowers;
};